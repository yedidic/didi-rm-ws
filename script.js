(() => {
  "use strict";

  const DEFAULT_LANGUAGE = "he";
  const SITE_URL = "https://didi.yoga-house.co/";
  const STORAGE = {
    language: "didi-language",
    accessibility: "didi-accessibility"
  };

  let language = DEFAULT_LANGUAGE;
  let messages = {};
  let accessibility = defaultAccessibility();

  const root = document.documentElement;
  const body = document.body;
  const liveRegion = document.querySelector(".live-region");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-nav");
  const submenuButton = document.querySelector(".nav-submenu-toggle");
  const navGroup = document.querySelector(".nav-group");
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
    writeJson(STORAGE.language, language);
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
    setMeta("meta[name='author']", getValue("brand.name"));
    setMeta("meta[property='og:site_name']", getValue("brand.name"));
    setMeta("meta[property='og:locale']", language === "he" ? "he_IL" : "en_US");
    setMeta("meta[property='og:locale:alternate']", language === "he" ? "en_US" : "he_IL");
    setMeta("meta[property='og:title']", getValue("meta.title"));
    setMeta("meta[property='og:description']", getValue("meta.ogDescription"));
    setMeta("meta[property='og:image:alt']", getValue("images.heroAlt"));
    setMeta("meta[name='twitter:title']", getValue("meta.title"));
    setMeta("meta[name='twitter:description']", getValue("meta.ogDescription"));
    setMeta("meta[name='twitter:image:alt']", getValue("images.heroAlt"));
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
    const phone = getValue("contact.links.phone")?.replace(/^tel:/, "");
    const schema = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}#business`,
      name: getValue("brand.name"),
      url: SITE_URL,
      description: getValue("meta.description"),
      image: new URL("images/hero-room.jpg", SITE_URL).href,
      logo: new URL("images/rm-logo.svg", SITE_URL).href,
      telephone: phone,
      email: getValue("contact.emailValue"),
      areaServed: getValue("schema.areaServed"),
      address: {
        "@type": "PostalAddress",
        addressLocality: getValue("schema.areaServed"),
        addressRegion: getValue("schema.areaServed"),
        addressCountry: "IL"
      },
      sameAs: [getValue("contact.links.instagram")],
      serviceType: getValue("schema.serviceType"),
      makesOffer: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: getValue("services.rosen.title"),
            description: getValue("services.rosen.lead")
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: getValue("services.yoga.title"),
            description: getValue("services.yoga.lead")
          }
        }
      ]
    };
    document.querySelector("#structured-data").textContent = JSON.stringify(schema);
  }

  function determineInitialLanguage() {
    const stored = readJson(STORAGE.language);
    if (["he", "en"].includes(stored)) return stored;
    return DEFAULT_LANGUAGE;
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

  function loadAccessibility() {
    const stored = readJson(STORAGE.accessibility);
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
    writeJson(STORAGE.accessibility, accessibility);
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
    });
  }

  async function init() {
    try {
      await setLanguage(determineInitialLanguage());
      loadAccessibility();
      setupNavigation();
      setupReveals();
      setupAccessibility();
      setupGlobalKeyboard();
      document.querySelectorAll("[data-language-switch]").forEach((button) => button.addEventListener("click", () => {
        setLanguage(language === "he" ? "en" : "he", true)
          .then(closeMenu)
          .catch((error) => console.error("Language switch failed.", error));
      }));
    } catch (error) {
      console.error("The website could not be initialized.", error);
      document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    }
  }

  init();
})();
