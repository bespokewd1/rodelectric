document.addEventListener("astro:page-load", () => {
	if (typeof window.__mobileStickyCtaCleanup === "function") {
		window.__mobileStickyCtaCleanup();
	}

	const strip = document.querySelector("#mobile-sticky-cta");
	if (!strip) return;

	const mobileQuery = window.matchMedia("(max-width: 767.98px)");
	const body = document.body;
	const toggle = document.querySelector("#cs-toggle");
	const scrollThreshold = 14;
	const topOffset = 16;

	let lastScrollY = window.scrollY;
	let frameId = 0;

	const showStrip = () => strip.classList.remove("translate-y-full");
	const hideStrip = () => strip.classList.add("translate-y-full");

	const syncState = () => {
		lastScrollY = window.scrollY;

		if (!mobileQuery.matches) {
			showStrip();
			return;
		}

		if (body.classList.contains("cs-open")) {
			hideStrip();
			return;
		}

		if (window.scrollY <= topOffset) {
			showStrip();
		}
	};

	const handleScroll = () => {
		if (frameId) return;

		frameId = window.requestAnimationFrame(() => {
			frameId = 0;

			if (!mobileQuery.matches) {
				showStrip();
				lastScrollY = window.scrollY;
				return;
			}

			const currentScrollY = window.scrollY;

			if (body.classList.contains("cs-open")) {
				hideStrip();
				lastScrollY = currentScrollY;
				return;
			}

			if (currentScrollY <= topOffset) {
				showStrip();
				lastScrollY = currentScrollY;
				return;
			}

			const scrollDelta = currentScrollY - lastScrollY;
			if (Math.abs(scrollDelta) < scrollThreshold) return;

			if (scrollDelta > 0) {
				hideStrip();
			} else {
				showStrip();
			}

			lastScrollY = currentScrollY;
		});
	};

	const handleViewportChange = () => {
		syncState();
	};

	const handleToggle = () => {
		window.requestAnimationFrame(syncState);
	};

	window.addEventListener("scroll", handleScroll, { passive: true });
	window.addEventListener("resize", handleViewportChange, { passive: true });
	toggle?.addEventListener("click", handleToggle);

	if (typeof mobileQuery.addEventListener === "function") {
		mobileQuery.addEventListener("change", handleViewportChange);
	} else if (typeof mobileQuery.addListener === "function") {
		mobileQuery.addListener(handleViewportChange);
	}

	syncState();

	window.__mobileStickyCtaCleanup = () => {
		window.removeEventListener("scroll", handleScroll);
		window.removeEventListener("resize", handleViewportChange);
		toggle?.removeEventListener("click", handleToggle);

		if (typeof mobileQuery.removeEventListener === "function") {
			mobileQuery.removeEventListener("change", handleViewportChange);
		} else if (typeof mobileQuery.removeListener === "function") {
			mobileQuery.removeListener(handleViewportChange);
		}

		if (frameId) {
			window.cancelAnimationFrame(frameId);
			frameId = 0;
		}
	};
});
