import { readFile, writeFile } from "node:fs/promises";

const pages = [
  { html: "index.html", locale: "locales/he.json" },
  { html: "en/index.html", locale: "locales/en.json" },
  { html: "kundalini.html", locale: "locales/he.json" },
  { html: "en/kundalini.html", locale: "locales/en.json" }
];

function getValue(data, path) {
  return path.split(".").reduce((value, key) => value?.[key], data);
}

function escapeText(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeText(value).replaceAll('"', "&quot;");
}

function render(html, data) {
  html = html.replace(
    /<([a-z][\w-]*)([^>]*\sdata-i18n="([^"]+)"[^>]*)>[^<]*<\/\1\s*>/gi,
    (match, tag, attributes, key) => {
      const value = getValue(data, key);
      return typeof value === "string"
        ? `<${tag}${attributes}>${escapeText(value)}</${tag}>`
        : match;
    }
  );

  html = html.replace(
    /<([a-z][\w-]*)([^>]*\sdata-i18n-aria="([^"]+)"[^>]*)>/gi,
    (match, tag, attributes, key) => {
      const value = getValue(data, key);
      if (typeof value !== "string") return match;
      const nextAttributes = attributes.replace(
        /aria-label="[^"]*"/,
        `aria-label="${escapeAttribute(value)}"`
      );
      return `<${tag}${nextAttributes}>`;
    }
  );

  html = html.replace(
    /<img([^>]*\sdata-i18n-alt="([^"]+)"[^>]*)>/gi,
    (match, attributes, key) => {
      const value = getValue(data, key);
      if (typeof value !== "string") return match;
      const nextAttributes = attributes.replace(
        /alt="[^"]*"/,
        `alt="${escapeAttribute(value)}"`
      );
      return `<img${nextAttributes}>`;
    }
  );

  html = html.replace(
    /<a([^>]*\sdata-contact="([^"]+)"[^>]*)>/gi,
    (match, attributes, type) => {
      const value = data.contact?.links?.[type];
      if (typeof value !== "string") return match;
      const nextAttributes = attributes.replace(
        /href="[^"]*"/,
        `href="${escapeAttribute(value)}"`
      );
      return `<a${nextAttributes}>`;
    }
  );

  return html;
}

for (const page of pages) {
  const [html, localeText] = await Promise.all([
    readFile(page.html, "utf8"),
    readFile(page.locale, "utf8")
  ]);
  const data = JSON.parse(localeText);
  await writeFile(page.html, render(html, data));
  console.log(`Rendered ${page.locale} into ${page.html}`);
}
