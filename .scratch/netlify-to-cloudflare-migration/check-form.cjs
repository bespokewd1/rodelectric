const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('src/components/Process/OurProcessQuoteForm.astro', 'utf8');
const script = source.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];

function setup(fetchImpl, fields = { access_key: 'public-test-key', email: 'visitor@example.com', name: 'Test Visitor', phone: '555-0100', 'service-needed': 'Lighting Installation', message: 'Mock submission only' }) {
  class Element {
    constructor() {
      this.textContent = '';
      this.classes = new Set();
      this.classList = {
        add: (...names) => names.forEach(name => this.classes.add(name)),
        remove: (...names) => names.forEach(name => this.classes.delete(name)),
      };
    }
  }
  class Button extends Element {}
  class Form extends Element {}
  const button = new Button();
  button.dataset = { defaultLabel: 'Request Free Quote' };
  const buttonText = new Element();
  button.querySelector = () => buttonText;
  const status = new Element();
  const title = new Element();
  const body = new Element();
  const state = { calls: 0, resets: 0, valid: true, handlers: 0, busy: false, events: {} };
  const form = new Form();
  form.dataset = {};
  form.action = 'https://api.web3forms.com/submit';
  form.querySelector = selector => ({
    '[data-process-quote-submit]': button,
    '[data-process-quote-status]': status,
    '[data-process-quote-status-title]': title,
    '[data-process-quote-status-body]': body,
  })[selector];
  form.reportValidity = () => state.valid;
  form.setAttribute = () => { state.busy = true; };
  form.removeAttribute = () => { state.busy = false; };
  form.reset = () => { state.resets++; };
  let submit;
  form.addEventListener = (type, handler) => { submit = handler; state.handlers++; };
  const context = {
    HTMLElement: Element, HTMLButtonElement: Button, HTMLFormElement: Form,
    FormData: class extends Map { constructor() { super(Object.entries(fields)); } },
    document: {
      querySelectorAll: () => [form],
      addEventListener: (name, handler) => { state.events[name] = handler; },
    },
    window: {}, console: { error() {} },
    fetch: async (...args) => { state.calls++; state.request = args; return fetchImpl(...args); },
  };
  vm.runInNewContext(script, context);
  return { state, button, buttonText, status, title, body, context, submit: () => submit({ preventDefault() {} }) };
}

(async () => {
  let resolve;
  const success = setup(() => new Promise(r => { resolve = r; }));
  const pending = success.submit();
  assert.equal(success.button.disabled, true);
  assert.equal(success.buttonText.textContent, 'Sending...');
  assert.equal(success.state.busy, true);
  await success.submit();
  assert.equal(success.state.calls, 1, 'Concurrent request must be blocked');
  resolve({ ok: true, json: async () => ({ success: true }) });
  await pending;
  assert.equal(success.state.resets, 1);
  assert.equal(success.title.textContent, 'Request received');
  assert.equal(success.status.hidden, false);
  assert.equal(success.button.disabled, false);
  assert.equal(success.state.busy, false);
  assert.equal(success.buttonText.textContent, 'Request Free Quote');
  assert.equal(success.state.request[0], 'https://api.web3forms.com/submit');
  const payload = JSON.parse(success.state.request[1].body);
  assert.equal(payload.email, 'visitor@example.com');
  assert.equal(payload.message, 'Mock submission only');
  assert.equal(payload['service-needed'], 'Lighting Installation');
  success.state.events['astro:page-load']();
  success.state.events['astro:after-swap']();
  vm.runInNewContext(script, success.context);
  assert.equal(success.state.handlers, 1, 'Navigation and reruns must not duplicate handlers');

  for (const fetchImpl of [
    async () => ({ ok: false, status: 429, json: async () => ({ success: false }) }),
    async () => ({ ok: false, status: 500, json: async () => ({ success: true }) }),
    async () => ({ ok: true, json: async () => ({ success: false }) }),
    async () => ({ ok: true, json: async () => ({}) }),
    async () => ({ ok: true, json: async () => { throw new Error('Malformed JSON'); } }),
    async () => { throw new Error('Network failure'); },
  ]) {
    const failure = setup(fetchImpl);
    await failure.submit();
    assert.equal(failure.state.resets, 0, 'Failed requests must retain values');
    assert.equal(failure.title.textContent, 'Request not sent');
    assert.equal(failure.status.hidden, false);
    assert.equal(failure.button.disabled, false);
    assert.equal(failure.state.busy, false);
    assert.equal(failure.buttonText.textContent, 'Request Free Quote');
  }

  for (const fields of [{}, { access_key: '  ' }, { access_key: 'public-test-key', botcheck: 'on' }]) {
    const blocked = setup(() => { throw new Error('Must not send'); }, fields);
    await blocked.submit();
    assert.equal(blocked.state.calls, 0);
    assert.equal(blocked.title.textContent, 'Request not sent');
  }
  const invalid = setup(() => { throw new Error('Must not send'); });
  invalid.state.valid = false;
  await invalid.submit();
  assert.equal(invalid.state.calls, 0);

  for (const route of ['about', 'contact', 'services', 'cctv-security-cameras']) {
    const html = fs.readFileSync(`dist/${route}/index.html`, 'utf8');
    const form = html.match(/<form\b[^>]*data-process-quote-form[\s\S]*?<\/form>/)?.[0];
    assert.ok(form, `${route}: built form present`);
    assert.match(form, /action="https:\/\/api.web3forms.com\/submit"/);
    assert.match(form, /name="access_key" value="63cb7248-3764-40f7-b3ed-d273b644efda"/);
    assert.doesNotMatch(form, /data-netlify|netlify-honeypot|form-name|bot-field/);
    assert.equal((form.match(/\brequired\b/g) || []).length, 5);
    assert.match(form, /aria-live="polite"/);
  }
  console.log('Passed: built forms on four routes, payload, success, duplicate prevention, validation, missing key, honeypot, HTTP/API rejection, malformed JSON, network failure, input retention, and Astro rebinding. No live requests sent.');
})();
