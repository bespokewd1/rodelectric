// Astro:page-load wrapper for View Transitions purposes
document.addEventListener("astro:page-load", () => {
	// Make the script controlling the <Hamburger /> mobile menu component available after navigating to a new page.

	(() => {
		// Configuration
		const CONFIG = {
			BREAKPOINTS: {
				MOBILE: 1023.5,
			},
			SELECTORS: {
				body: "body",
				navigation: "#cs-navigation",
				hamburger: "#cs-navigation .cs-toggle",
				menuWrapper: "#cs-ul-wrapper",
				dropdownToggle: ".cs-dropdown-toggle",
				dropdown: ".cs-dropdown",
				dropdownMenu: ".cs-drop-ul",
				navButton: ".cs-nav-button",
				darkModeToggle: "#dark-mode-toggle",
			},
			CLASSES: {
				active: "cs-active",
				menuOpen: "cs-open",
			},
		};

		// DOM Elements
		const elements = {
			body: document.querySelector(CONFIG.SELECTORS.body),
			navigation: document.querySelector(CONFIG.SELECTORS.navigation),
			hamburger: document.querySelector(CONFIG.SELECTORS.hamburger),
			menuWrapper: document.querySelector(CONFIG.SELECTORS.menuWrapper),
			navButton: document.querySelector(CONFIG.SELECTORS.navButton),
			darkModeToggle: document.querySelector(CONFIG.SELECTORS.darkModeToggle),
		};

		// Utilities
		const isMobile = () => window.matchMedia(`(max-width: ${CONFIG.BREAKPOINTS.MOBILE}px)`).matches;

		// Dropdown Management
		const dropdownManager = {
			setOpen(dropdown, isOpen) {
				dropdown.classList.toggle(CONFIG.CLASSES.active, isOpen);
				const button = dropdown.querySelector(CONFIG.SELECTORS.dropdownToggle);
				const menu = dropdown.querySelector(CONFIG.SELECTORS.dropdownMenu);

				button?.setAttribute("aria-expanded", String(isOpen));
				if (menu) menu.inert = !isOpen;
			},

			close(dropdown, shouldFocus = false) {
				if (!dropdown || !dropdown.classList.contains(CONFIG.CLASSES.active)) return false;

				this.setOpen(dropdown, false);
				if (shouldFocus) dropdown.querySelector(CONFIG.SELECTORS.dropdownToggle)?.focus();
				return true;
			},

			toggle(dropdown) {
				this.setOpen(dropdown, !dropdown.classList.contains(CONFIG.CLASSES.active));
			},

			closeAll(shouldFocus = false) {
				if (!elements.navigation) return false;
				let closed = false;

				elements.navigation.querySelectorAll(`${CONFIG.SELECTORS.dropdown}.${CONFIG.CLASSES.active}`).forEach((dropdown) => {
					this.close(dropdown, shouldFocus);
					closed = true;
				});

				return closed;
			},
		};

		// Menu Management
		const menuManager = {
			setOpen(isOpen) {
				if (!elements.hamburger || !elements.navigation) return;

				[elements.hamburger, elements.navigation].forEach((el) => el.classList.toggle(CONFIG.CLASSES.active, isOpen));
				elements.body.classList.toggle(CONFIG.CLASSES.menuOpen, isOpen);
				elements.body.style.overflow = isOpen ? "hidden" : "";
				elements.hamburger.setAttribute("aria-expanded", String(isOpen));
				elements.hamburger.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
				if (elements.menuWrapper) elements.menuWrapper.inert = isMobile() && !isOpen;

				if (!isOpen) dropdownManager.closeAll();
			},

			toggle() {
				menuManager.setOpen(!elements.navigation?.classList.contains(CONFIG.CLASSES.active));
			},
		};

		// Keyboard Management
		const keyboardManager = {
			handleEscape() {
				if (!elements.navigation) return;

				// Close any open dropdown menus first
				const dropdownsClosed = dropdownManager.closeAll(true);
				if (dropdownsClosed) return;

				// Then close hamburger menu if open
				if (elements.hamburger && elements.hamburger.classList.contains(CONFIG.CLASSES.active)) {
					menuManager.toggle();
					elements.hamburger.focus();
				}
			},
		};

		// Event Management
		const eventManager = {
			handleDropdownClick(event) {
				const button = event.target.closest(CONFIG.SELECTORS.dropdownToggle);
				if (!button) return;

				event.preventDefault();
				const dropdown = button.closest(CONFIG.SELECTORS.dropdown);
				if (dropdown) {
					dropdownManager.toggle(dropdown);
				}
			},

			handleDropdownKeydown(event) {
				if (event.key !== "Enter" && event.key !== " ") return;

				const button = event.target.closest(CONFIG.SELECTORS.dropdownToggle);
				if (!button) return;

				event.preventDefault();
				const dropdown = button.closest(CONFIG.SELECTORS.dropdown);
				if (dropdown) {
					dropdownManager.toggle(dropdown);
				}
			},

			handleFocusOut(event) {
				setTimeout(() => {
					if (!event.relatedTarget) return;

					const dropdown = event.target.closest(CONFIG.SELECTORS.dropdown);
					if (dropdown?.classList.contains(CONFIG.CLASSES.active) && !dropdown.contains(event.relatedTarget)) {
						dropdownManager.close(dropdown);
					}
				}, 10);
			},

			handleMobileFocus(event) {
				if (!isMobile() || !elements.navigation.classList.contains(CONFIG.CLASSES.active)) return;
				if (elements.menuWrapper.contains(event.target) || elements.hamburger.contains(event.target)) return;

				menuManager.toggle();
			},

			handleDropdownFocus(event) {
				if (isMobile()) return;

				const dropdown = event.target.closest(CONFIG.SELECTORS.dropdown);
				if (!dropdown) return;

				if (event.target.closest(CONFIG.SELECTORS.dropdownToggle)) {
					if (!event.relatedTarget?.closest(CONFIG.SELECTORS.dropdownMenu)) dropdownManager.close(dropdown);
					return;
				}

				dropdownManager.setOpen(dropdown, true);
			},

			handleDropdownHover(event) {
				if (isMobile() || !event.target.matches(CONFIG.SELECTORS.dropdown)) return;

				const dropdown = event.target;
				if (event.type === "mouseenter") {
					dropdownManager.setOpen(dropdown, true);
				} else if (!dropdown.contains(document.activeElement)) {
					dropdownManager.close(dropdown);
				}
			},
		};

		// Initialization & Setup
		const init = {
			inertState() {
				if (!elements.menuWrapper) return;

				elements.menuWrapper.inert = isMobile() && !elements.navigation.classList.contains(CONFIG.CLASSES.active);

				elements.navigation.querySelectorAll(CONFIG.SELECTORS.dropdown).forEach((dropdown) => {
					dropdownManager.setOpen(dropdown, dropdown.classList.contains(CONFIG.CLASSES.active));
				});
			},

			eventListeners() {
				if (!elements.hamburger || !elements.navigation) return;

				// Hamburger menu
				elements.hamburger.addEventListener("click", menuManager.toggle);
				elements.navigation.addEventListener("click", (e) => {
					if (e.target === elements.navigation && elements.navigation.classList.contains(CONFIG.CLASSES.active)) {
						menuManager.toggle();
					}
				});

				// Dropdown delegation
				elements.navigation.addEventListener("click", eventManager.handleDropdownClick);
				elements.navigation.addEventListener("keydown", eventManager.handleDropdownKeydown);
				elements.navigation.addEventListener("focusin", eventManager.handleDropdownFocus);
				elements.navigation.addEventListener("focusout", eventManager.handleFocusOut);

				// Desktop hover disclosure state
				elements.navigation.addEventListener("mouseenter", eventManager.handleDropdownHover, true);
				elements.navigation.addEventListener("mouseleave", eventManager.handleDropdownHover, true);

				// Global events
				document.addEventListener("keydown", (e) => e.key === "Escape" && keyboardManager.handleEscape());
				document.addEventListener("focusin", eventManager.handleMobileFocus);

				// Keep open mobile menus reachable when their viewport resizes.
				let wasMobile = isMobile();
				window.addEventListener("resize", () => {
					const mobile = isMobile();
					if (mobile !== wasMobile) {
						menuManager.setOpen(false);
						wasMobile = mobile;
					}
					this.inertState();
				});
			},
		};

		// Initialize navigation system
		init.inertState();
		init.eventListeners();
	})();
});
