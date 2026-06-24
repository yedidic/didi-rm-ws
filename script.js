(() => {
  "use strict";

  const DEFAULT_LANGUAGE = "he";
  const STORAGE = {
    consent: "didi-consent",
    language: "didi-language",
    accessibility: "didi-accessibility"
  };

  let language = DEFAULT_LANGUAGE;
  let messages = {};
  let consent = readJson(STORAGE.consent);
  let accessibility = defaultAccessibility();

  const root = document.documentElement;
  const body = document.body;
  const liveRegion = document.querySelector(".live-region");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-nav");
  const submenuButton = document.querySelector(".nav-submenu-toggle");
  const navGroup = document.querySelector(".nav-group");
  const cookieBanner = document.querySelector("[data-cookie-banner]");
  const preferencesDialog = document.querySelector("[data-preferences-dialog]");
  const functionalConsent = document.querySelector("[data-functional-consent]");
  const a11yTrigger = document.querySelector(".a11y-trigger");
  const a11yPanel = document.querySelector(".a11y-panel");

  function readJson(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn(`Could not read ${key} from local storage.`, error);
      return null;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Could not save ${key} to local storage.`, error);
      return false;
    }
  }

  function removeStored(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Could not remove ${key} from local storage.`, error);
    }
  }

  function defaultAccessibility() {
    return { fontScale: 1, contrast: false, links: false, motion: false };
  }

  function getValue(path) {
    return path.split(".").reduce((value, key) => value?.[key], messages);
  }

  async function fetchLanguage(requestedLanguage) {
    try {
      const response = await fetch(`locales/${requestedLanguage}.json`, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { data: await response.json(), resolvedLanguage: requestedLanguage };
    } catch (error) {
      console.warn(`Could not load the ${requestedLanguage} locale.`, error);
      if (requestedLanguage !== "en") {
        console.warn("Falling back to English.");
        return fetchLanguage("en");
      }
      throw error;
    }
  }

  async function setLanguage(nextLanguage, announce = false) {
    const { data, resolvedLanguage } = await fetchLanguage(nextLanguage);
    language = resolvedLanguage;
    messages = data;
    root.lang = language;
    root.dir = language === "he" ? "rtl" : "ltr";
    translatePage();
    updateMetadata();
    updateContactLinks();
    updateStructuredData();
    syncMenuA11y();
    if (consent?.functional) writeJson(STORAGE.language, language);
    if (announce) announceMessage(getValue("language.changed"));
  }

  function translatePage() {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = getValue(element.dataset.i18n);
      if (typeof value === "string") element.textContent = value;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      const value = getValue(element.dataset.i18nAria);
      if (typeof value === "string") element.setAttribute("aria-label", value);
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
      const value = getValue(element.dataset.i18nAlt);
      if (typeof value === "string") element.alt = value;
    });
    body.classList.add("content-ready");
  }

  function updateMetadata() {
    document.title = getValue("meta.title");
    setMeta("meta[name='description']", getValue("meta.description"));
    setMeta("meta[property='og:title']", getValue("meta.title"));
    setMeta("meta[property='og:description']", getValue("meta.ogDescription"));
  }

  function setMeta(selector, value) {
    const element = document.querySelector(selector);
    if (element && value) element.content = value;
  }

  function updateContactLinks() {
    document.querySelectorAll("[data-contact]").forEach((link) => {
      const type = link.dataset.contact;
      const href = getValue(`contact.links.${type}`);
      if (!href) return;
      link.href = href;
      if (["instagram", "whatsapp"].includes(type)) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    });
  }

  function updateStructuredData() {
    const schema = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: getValue("brand.name"),
      description: getValue("meta.description"),
      image: new URL("images/hero-room.jpg", window.location.href).href,
      areaServed: getValue("schema.areaServed"),
      address: {
        "@type": "PostalAddress",
        addressLocality: getValue("schema.areaServed"),
        addressCountry: "IL"
      },
      serviceType: getValue("schema.serviceType")
    };
    document.querySelector("#structured-data").textContent = JSON.stringify(schema);
  }

  function determineInitialLanguage() {
    const stored = consent?.functional ? readJson(STORAGE.language) : null;
    if (["he", "en"].includes(stored)) return stored;
    return navigator.language?.toLowerCase().startsWith("en") ? "en" : DEFAULT_LANGUAGE;
  }

  function syncMenuA11y() {
    const isOpen = navigation.classList.contains("is-open");
    menuButton.setAttribute("aria-label", getValue(isOpen ? "nav.closeMenu" : "nav.openMenu") || "");
  }

  function closeMenu() {
    navigation.classList.remove("is-open");
    body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    navGroup.classList.remove("is-open");
    submenuButton.setAttribute("aria-expanded", "false");
    syncMenuA11y();
  }

  function setupNavigation() {
    menuButton.addEventListener("click", () => {
      const open = !navigation.classList.contains("is-open");
      navigation.classList.toggle("is-open", open);
      body.classList.toggle("menu-open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      syncMenuA11y();
    });

    submenuButton.addEventListener("click", () => {
      const open = !navGroup.classList.contains("is-open");
      navGroup.classList.toggle("is-open", open);
      submenuButton.setAttribute("aria-expanded", String(open));
    });

    navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 920) closeMenu();
    });
    window.addEventListener("scroll", () => {
      document.querySelector(".site-header").classList.toggle("scrolled", window.scrollY > 24);
    }, { passive: true });
  }

  function setupReveals() {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
  }

  function saveConsent(functional) {
    consent = { functional, updatedAt: new Date().toISOString() };
    writeJson(STORAGE.consent, consent);
    cookieBanner.hidden = true;
    if (functional) {
      writeJson(STORAGE.language, language);
      writeJson(STORAGE.accessibility, accessibility);
    } else {
      removeStored(STORAGE.language);
      removeStored(STORAGE.accessibility);
    }
    announceMessage(getValue("cookie.saved"));
  }

  function openPreferences() {
    functionalConsent.checked = Boolean(consent?.functional);
    if (typeof preferencesDialog.showModal === "function") preferencesDialog.showModal();
    else preferencesDialog.setAttribute("open", "");
  }

  function setupConsent() {
    cookieBanner.hidden = Boolean(consent);
    document.querySelectorAll("[data-cookie-settings]").forEach((button) => button.addEventListener("click", openPreferences));
    document.querySelector("[data-consent='accept']").addEventListener("click", () => saveConsent(true));
    document.querySelector("[data-consent='reject']").addEventListener("click", () => saveConsent(false));
    document.querySelector("[data-consent='preferences']").addEventListener("click", openPreferences);
    document.querySelector("[data-consent='save']").addEventListener("click", () => saveConsent(functionalConsent.checked));
  }

  function loadAccessibility() {
    const stored = consent?.functional ? readJson(STORAGE.accessibility) : null;
    accessibility = { ...defaultAccessibility(), ...(stored || {}) };
    applyAccessibility();
  }

  function applyAccessibility() {
    root.style.setProperty("--font-scale", accessibility.fontScale);
    body.classList.toggle("high-contrast", accessibility.contrast);
    body.classList.toggle("highlight-links", accessibility.links);
    body.classList.toggle("reduce-motion", accessibility.motion);
    document.querySelector("[data-a11y-action='contrast']").setAttribute("aria-pressed", String(accessibility.contrast));
    document.querySelector("[data-a11y-action='links']").setAttribute("aria-pressed", String(accessibility.links));
    document.querySelector("[data-a11y-action='motion']").setAttribute("aria-pressed", String(accessibility.motion));
  }

  function updateAccessibility(action) {
    if (action === "font-up") accessibility.fontScale = Math.min(1.25, +(accessibility.fontScale + 0.1).toFixed(2));
    if (action === "font-down") accessibility.fontScale = Math.max(0.9, +(accessibility.fontScale - 0.1).toFixed(2));
    if (action === "contrast") accessibility.contrast = !accessibility.contrast;
    if (action === "links") accessibility.links = !accessibility.links;
    if (action === "motion") accessibility.motion = !accessibility.motion;
    if (action === "reset") accessibility = defaultAccessibility();
    applyAccessibility();
    if (consent?.functional) writeJson(STORAGE.accessibility, accessibility);
    announceMessage(getValue(action === "reset" ? "a11y.resetDone" : "a11y.updated"));
  }

  function closeAccessibility() {
    a11yPanel.hidden = true;
    a11yTrigger.setAttribute("aria-expanded", "false");
  }

  function setupAccessibility() {
    a11yTrigger.addEventListener("click", () => {
      const open = a11yPanel.hidden;
      a11yPanel.hidden = !open;
      a11yTrigger.setAttribute("aria-expanded", String(open));
      if (open) a11yPanel.querySelector("button").focus();
    });
    document.querySelector("[data-a11y-close]").addEventListener("click", closeAccessibility);
    document.querySelectorAll("[data-a11y-action]").forEach((button) => {
      button.addEventListener("click", () => updateAccessibility(button.dataset.a11yAction));
    });
  }

  function announceMessage(message) {
    if (!message) return;
    liveRegion.textContent = "";
    window.setTimeout(() => { liveRegion.textContent = message; }, 30);
  }

  function setupGlobalKeyboard() {
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeMenu();
      closeAccessibility();
      if (preferencesDialog.open) preferencesDialog.close();
    });
  }

  async function init() {
    try {
      await setLanguage(determineInitialLanguage());
      loadAccessibility();
      setupNavigation();
      setupReveals();
      setupConsent();
      setupAccessibility();
      setupGlobalKeyboard();
      document.querySelector("[data-language-switch]").addEventListener("click", () => {
        setLanguage(language === "he" ? "en" : "he", true).catch((error) => console.error("Language switch failed.", error));
      });
    } catch (error) {
      console.error("The website could not be initialized.", error);
      document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    }
  }

  init();
})();
