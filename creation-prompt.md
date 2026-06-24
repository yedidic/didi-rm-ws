# Portfolio website creation brief

Create a polished, warm, bilingual one-page portfolio website for Didi Cohen, a Rosen Method Bodywork Practitioner based in Rehavia, Jerusalem.

## Goal and tone

The website should help prospective clients understand who Didi is, what Rosen Method Bodywork and Kundalini Yoga offer, and how to get in touch.

The visual and written tone should feel calm, grounded, personal, spacious, and trustworthy—not clinical, mystical, corporate, or overly promotional. Use clear, human language and avoid unsupported medical or therapeutic claims.

## Technical requirements

- Build the site with `index.html`, `styles.css`, `script.js`, and dedicated locale files at `locales/en.json` and `locales/he.json`.
- Use only semantic HTML, modern CSS, and vanilla JavaScript. Do not use a framework, build step, server, database, or backend.
- The finished site must work when served by any local or hosted static web server. Do not rely on opening `index.html` directly with the `file://` protocol, because the locale JSON files will be loaded with `fetch()`.
- Support Hebrew and English without an external i18n dependency. Load the active language with `fetch()` from its dedicated JSON file.
- Store all user-facing content in the locale files—not in the HTML or JavaScript—including navigation labels, headings, paragraphs, calls to action, accessibility labels, image alt text, contact labels, placeholders, status notes, and footer text.
- Give `locales/en.json` and `locales/he.json` the same nested key structure. Keep content separate from presentation and behavior.
- Use stable semantic keys such as `nav.about`, `hero.title`, and `services.rosen.description`; do not use complete English sentences as translation keys.
- Add graceful handling for a missing or malformed locale file. Fall back to English and show a useful console warning without breaking the page.
- Add a visible language switcher and remember the visitor's selection with `localStorage`.
- Hebrew must use `lang="he"` and `dir="rtl"`; English must use `lang="en"` and `dir="ltr"`. Update these attributes when the language changes.
- Make the site responsive and polished on mobile, tablet, and desktop.
- Follow accessibility best practices: keyboard navigation, visible focus states, sufficient color contrast, meaningful landmarks and headings, useful image alt text, and support for reduced motion.
- Use lightweight CSS and JavaScript, with no unnecessary dependencies.

## Cookie consent and accessibility add-on

- Add a free, lightweight, client-side cookie-consent banner with complete Hebrew and English support, including correct RTL/LTR behavior.
- The banner must clearly explain which storage or cookies the site uses and offer accessible **Accept**, **Reject**, and **Preferences** controls. Store the visitor's choice and provide a persistent way to reopen or change it.
- Do not load non-essential analytics, embeds, or marketing scripts before consent. If the finished site uses only essential local storage, say so accurately rather than implying that tracking is present.
- Keep all banner copy, button labels, preference-category names, and accessibility labels in `locales/en.json` and `locales/he.json`.
- Add a free accessibility add-on or toolbar that fully supports Hebrew, English, RTL, keyboard use, and screen readers. It must not require a paid subscription, account, backend, or vendor lock-in.
- Include practical controls such as increasing and decreasing text size, enhanced contrast, highlighting links, pausing animations, and resetting preferences. Persist accessibility preferences locally.
- Keep all accessibility-toolbar text and labels in the per-language JSON files.
- The add-on must complement the site's built-in semantic HTML and accessibility—not act as a substitute for WCAG-conscious design, keyboard support, correct focus behavior, contrast, and screen-reader compatibility.
- Prefer a small, auditable open-source solution or a simple custom vanilla-JavaScript implementation. Avoid intrusive accessibility overlays and third-party scripts that collect visitor data.
- Do not claim that either feature guarantees legal compliance. Briefly document what was implemented and identify any privacy or accessibility details that should receive professional review before launch.

## Site structure

Create a one-page landing-page layout with a sticky navigation menu and smooth scrolling. Include:

1. **Hero**
   - Didi's name and professional role
   - A short, warm introduction
   - A primary call to action that scrolls to Contact
   - A secondary call to action that scrolls to Working Together

2. **About Didi**
   - Based in Rehavia, Jerusalem
   - Husband to Maayan (מעיין) and father to Pelly Fani (פלאי פני)
   - Together with Maayan, manages “Beit Shel Yoga” / “בית של יוגה” (House of Yoga), a yoga studio and community in Jerusalem
   - Studied Rosen Method Bodywork from 2019 to 2023 and is currently an intern; make the internship status clear and accurate
   - Holds a BSW in Social Work from Bar-Ilan University
   - Is a Kundalini Yoga teacher and trainer who offers a weekly group class and private classes
   - Also works as a software engineer; mention this as part of Didi's broader background without making it the site's focus

3. **Working Together**
   - **Rosen Method Bodywork:** briefly explain the approach, what a session may feel like, and who might be interested in it
   - **Kundalini Yoga:** briefly explain the practice and mention weekly group and private classes
   - Present these as two clearly distinct services

4. **Testimonials / המלצות**
   - Design this section with clearly labeled placeholder testimonials
   - Do not invent names, quotes, outcomes, or client claims

5. **Contact / צור קשר**
   - Include editable placeholders for phone, email, WhatsApp, and relevant social links
   - Because there is no backend, use direct `mailto:`, `tel:`, and WhatsApp links instead of a non-functional contact form
   - Mention Rehavia, Jerusalem

6. **Footer**
   - Name, location, copyright, and a short professional-status note stating that Didi is a Rosen Method intern

The desktop navigation should contain:

- About Didi
- Working Together
  - Rosen Method
  - Kundalini Yoga
- Testimonials
- Contact

On mobile, provide an accessible collapsible menu. Ensure the Working Together submenu remains usable with touch and keyboard input.

## Content and research

Use these websites for research and inspiration. Do not copy their writing, branding, or layouts verbatim.

Primary visual and structural reference:

- https://www.rosenwithjane.co.uk/ — study this reference carefully, especially its calm pacing, use of space, hierarchy, and personal tone

Additional practitioner references:

- http://www.billsamsel.com/
- https://aivilo.at/
- https://www.imnordgrentherapy.co.uk/

Rosen Method background sources:

- https://rosenmethod.co.uk/
- https://www.rosenmethod.org.il/
- https://roseninstitute.net/

Kundalini Yoga background sources:

- https://kundaliniyoga.co.il/
- https://kundaliniyoga.org.il/

Write concise, original website copy based on reliable information from these sources. Do not fabricate qualifications, testimonials, health benefits, or personal details. If a fact is uncertain, use neutral wording or mark it as a placeholder rather than guessing.

## Visual direction

- Create an understated, contemporary wellness aesthetic with warm natural colors, generous whitespace, soft organic shapes, and restrained motion.
- Avoid generic “spa,” medical-office, and overly spiritual visual clichés.
- Choose typography that renders Hebrew and English well and maintains a coherent visual identity in both languages.
- Use locally replaceable placeholder images for now. Keep image references organized in an `images/` folder and make replacement straightforward.
- If actual image files cannot be generated, use tasteful CSS placeholders or clearly documented placeholder URLs; do not leave broken images.

## SEO and metadata

- Add a useful page title, meta description, canonical placeholder, Open Graph metadata, and basic structured data appropriate for a local professional service.
- Keep metadata bilingual where practical, without keyword stuffing. Store localized title, description, and social-sharing text in the locale JSON files and update the document metadata when the language changes. Include sensible default metadata in `index.html` for crawlers and failure states.

## Deliverables

Return the complete contents of:

1. `index.html`
2. `styles.css`
3. `script.js`
4. `locales/en.json`
5. `locales/he.json`

Also include:

- A short explanation of the design and content decisions
- A concise list of every placeholder Didi must replace before publishing
- Simple instructions for previewing the site through a local static server and deploying it to a static host

The result should be complete and functional, not a wireframe. Before finishing, validate both JSON files and check that their key structures match. Also test language switching, the English fallback, RTL/LTR layout, navigation, mobile behavior, keyboard access, links, cookie-consent behavior, accessibility-toolbar controls, persisted preferences, and the browser console for errors.
