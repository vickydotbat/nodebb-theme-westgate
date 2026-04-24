# AGENTS.md

## Project

This repository is `nodebb-theme-westgate`, a NodeBB theme for the Shadows Over Westgate forum.

It is forked from `nodebb-theme-quickstart` and should remain a small, focused NodeBB child theme rather than a full replacement for NodeBB or Harmony.

## Local Environment

- Theme repo: `/home/vicky/Projects/nodebb-dev/nodebb-theme-westgate`
- Working NodeBB install: `/home/vicky/Projects/nodebb-dev/forum`
- Development workflow uses Grunt hot reload from the NodeBB install.
- This theme targets NodeBB 4.x compatibility, as declared in `package.json`.

## Theme Direction

The visual target is black velvet silk, darkness, vampirism, decadence, and decay.

Use this palette direction:

- Plum and near-black as the dominant base.
- Muted gold for accents, borders, small highlights, and important affordances.
- Red only sparingly, preferably as a subtle detail or state color.
- Avoid bright, playful, clinical, or flat SaaS-style treatment.
- Favor depth, restraint, texture, and rich contrast over loud ornament.

Reference prior theme work in this repo through files in the `_references` directory:

`ref_palettes.css` is the clearest reference for the intended slick gradient treatment. Use that direction for foreground elements such as panels, topic rows, buttons, borders, accents, and active states. Keep gradients rich and polished, but avoid turning the entire page into a decorative gradient background.

When adding new visuals, study the reference files first and match the existing direction before introducing new motifs.

## NodeBB Theme Rules

Follow the current NodeBB theme model:

- `theme.json` defines theme metadata and the base theme.
- This project uses `baseTheme: "nodebb-theme-harmony"`.
- Keep this as a child theme unless the user explicitly asks for a larger rewrite.
- `theme.scss` is the theme entry point and must stay imports-only.
- Do not append substantive CSS/SCSS directly to `theme.scss`.
- Do not add new root-level theme styling files.
- Put substantive Westgate-specific style overrides under focused files in `scss/`.
- Keep `scss/overrides.scss` focused on Bootstrap/Harmony variable overrides that must load before Bootstrap.
- Template overrides belong under `templates/` and must preserve the same relative path as the Harmony template they replace.
- Do not copy or redefine Harmony templates unless an actual override is needed.
- If a template does not exist here, NodeBB inherits it from the configured base theme.

NodeBB theme documentation: https://docs.nodebb.org/development/themes/

## Current Files Of Interest

- `theme.json`: theme metadata and `baseTheme`.
- `plugin.json`: hooks, scripts, modules, template path, and static dirs.
- `theme.scss`: NodeBB SCSS entry point.
- `scss/overrides.scss`: current Westgate override layer.
- `lib/theme.js` and `lib/controllers.js`: server-side theme hooks/controllers.
- `public/client.js`: client-side theme behavior.
- `templates/`: local template overrides and admin templates.

## Working Practices

- Keep edits scoped to the theme package unless the task explicitly names the NodeBB install.
- Do not modify the working NodeBB install at `/home/vicky/Projects/nodebb-dev/forum` except for running build/dev commands or when explicitly asked.
- Prefer existing NodeBB, Harmony, Bootstrap, and local theme patterns over introducing new frameworks.
- Keep selectors maintainable and avoid broad global overrides unless they are intentional theme-wide tokens or resets.
- Avoid unrelated formatting churn.
- Before overriding a template, inspect the corresponding Harmony template and copy only what is necessary.
- Preserve accessibility: readable contrast, visible focus states, usable hover/active states, and no text hidden purely for visual effect unless there is an accessible alternative.

## Validation

Use the local NodeBB workflow when practical:

- From `/home/vicky/Projects/nodebb-dev/forum`, run the existing Grunt hot-reload task used by the project.
- Rebuild NodeBB assets when template or SCSS changes require it.
- For template overrides, verify that the rendered route uses the local template rather than falling back unexpectedly.
- For style work, check both desktop and mobile widths.
- Playwright browser validation is available in this environment after asset rebuilds; use it for rendered route checks and desktop/mobile screenshots against `http://localhost:4567`.

If validation cannot be run, report what was changed and what still needs to be checked in the running forum.

## Current Tasks

Complete and update as needed. Future-dated tasks and possibilities go into Future Tasks.

Statuses:

1. [x] marks total completion.
2. [-] marks partial completion: not exact specification.
3. [ ] marks incomplete.
4. [?] marks uncertainty or exception: treat as incomplete, expand as needed, and keep in scope.

Complete the following:

- [-] In the process of testing widgets, I noticed that some are being given the "card" treatment (the glossy purple background element) even if there is no card container. Example here: http://localhost:4567/user/admin
  - [x] Widgets without the card containers should display plainly.
  - [x] Widgets can be put inside of a card container to make a card.
  - [x] Expand this from a single-widget bug into a theme-wide widget compatibility pass. The current issue appears broader: too many generic containers, especially plain `<div>` wrappers emitted by widgets or templates, are inheriting the glossy purple gradient card treatment even when they are only structural wrappers.
  - [x] Define a compatibility model for widget rendering before implementation:
    - [x] Structural wrappers should remain visually neutral by default. A wrapper existing only for layout, spacing, templating, or plugin/widget output should not automatically become a "Westgate card".
    - [x] Card styling should be opt-in and intentional. The gradient/gloss/chrome treatment should apply only to known card surfaces, explicit card utility classes, or template regions that are semantically meant to read as panels.
    - [x] Plain-text widgets and lightweight HTML widgets must render cleanly without needing custom markup just to avoid accidental card chrome.
    - [x] Nested widget markup should not compound card styling. A widget inside a panel should not create boxes-within-boxes unless the nested card is intentional.
    - [x] Footer widgets require special handling. Footer text such as "Powered by NodeBB" should behave like footer chrome, not like a content card or panel.
  - [x] Build a proper investigation plan for global compatibility:
    - [x] Inventory which selectors currently apply the purple gradient/card treatment too broadly. Pay particular attention to rules targeting generic `div`, broad widget wrappers, `.card`, `.panel`, Bootstrap containers, Harmony wrappers, and footer/sidebar/account-page blocks.
    - [x] Trace the rendered wrapper stack for several widget types in the running forum, not just one route. Include at minimum: footer HTML widget, profile-page widget areas, sidebar widgets, category-page widgets, and any ACP-placed plain text/HTML widget.
    - [x] Distinguish between three classes of surfaces:
      - [x] structural wrappers
      - [x] content cards/panels
      - [x] utility text blocks / footer chrome / metadata strips
    - [x] Decide whether the best long-term model is:
      - [ ] tightening overly broad selectors so they only target real card components
      - [ ] introducing a small explicit Westgate card utility class for opt-in chrome
      - [ ] adding a small set of opt-out compatibility rules for widget regions that must stay plain
      - [x] or a hybrid of the above
    - 2026-04-24 implementation note: `scss/westgate/_widgets.scss` now limits chrome to known panel surfaces (`.card`, `.alert`, `.forum-stats`, `.search-widget`, `.category`, legacy `.panel`/`.well`/`.jumbotron`) plus explicit opt-in utility classes `.westgate-widget-card` and `.wg-widget-card`. Generic top-level wrappers in widget areas are neutral again, and footer wrappers are forced back to plain chrome.
  - [x] Define expected compatibility outcomes before coding:
    - [x] A plain HTML widget that outputs only text or a single `<div>` should render plainly.
    - [x] A widget wrapped in an intentional card class should receive the full glossy Westgate card treatment.
    - [x] Existing topic lists, category lists, and intentional content panels should keep their current Westgate identity.
    - [x] Footer widget areas should not automatically gain panel framing unless explicitly requested.
    - [x] Account/profile pages such as `/user/admin` should not pick up accidental panel chrome from generic wrappers.
    - [x] Widget/plugin markup from outside this theme should degrade gracefully even if it uses simple Bootstrap or generic `<div>` containers.
  - [-] Validation plan once implementation starts:
    - [ ] Check desktop and mobile for footer widgets, sidebar widgets, profile widgets, and at least one plain HTML widget with no special classes.
    - [ ] Confirm that intentionally carded widgets still look like Westgate cards.
    - [ ] Confirm that nested wrappers no longer create accidental card-on-card stacking.
    - [ ] Verify no regressions to topic cards, category panels, or other intentional glossy surfaces.
    - [x] Local investigation covered the rendered wrapper stack on `http://localhost:4567/user/admin`, `http://localhost:4567/categories`, `http://localhost:4567/category/2/announcements`, and the sidebar footer widget HTML from the live local render.

## Future Tasks

Tasks to be considered in the future, not implemented immediately. Keep them in scope when making decisions.

- [ ] Consider a light mode/dark mode toggle while retaining core theme, preferably without adding a Skin
- [ ] Un-bold "topics" and "posts" and make the color lines replace the black line drived from category background color to either use the foreground color of the icon, or an ornate gilding like the icons (image 2)
- [ ] Consider making the category names a bit smoother; it looks like it's not anti-aliased. (image 3)
- [ ] Mobile website doesn't use the correct fonts.

- [-] Implement curated game-icons support for category/subcategory icons: sanitize selected SVGs into mask-friendly theme assets, expose them through `staticDirs`, add reusable `wg-icon-*` CSS mask classes, and include category custom classes in the local category/subcategory templates if Harmony data supports them.
  - [x] Phase 1: Build our icon stack.
    - [x] Recommend icons from the game-icons pack for forum categories and their subcategories. See `GAME_ICONS.md`.
    - [x] Include the `.svg`/`.png` files in the theme if possible. SVG assets are in `public/game-icons/`.
    - [x] Author any necessary credits in a `.md` file at the root of the `nodebb-theme-westgate` repository. See `GAME_ICONS.md`.
  - [-] Phase 2: Implementation.
    - [x] Confirm category `class` data is present on all required render paths: `/categories`, category-page subcategory rows, category-page header, and AJAX-loaded "more subcategories" rows. NodeBB stores and escapes `category.class`; `getCategoryData`/`getCategoriesData` include it; the category template's `children` block is used for AJAX-loaded subcategories.
    - [x] Add ACP custom class output to local category templates. Root category rows and child/subcategory row wrappers now emit `{./class}` so classes like `wg-icon-scroll-quill` can control icons without hardcoding category IDs.
    - [x] Add a minimal local `templates/category.tpl` override, copied from Harmony only as needed, so the category page header can expose `{./class}` around its `buildCategoryIcon(...)` output.
    - [x] Keep `templates/partials/categories/children.tpl` as the single source of truth for nested child markup and collapse the duplicate child markup in `templates/partials/categories/item.tpl` back to the imported partial before adding icon classes.
    - [x] Implement the `wg-icon-*` CSS mask classes in the existing category SCSS layer. Use `public/game-icons/*.svg` through the theme static path, hide/neutralize the Font Awesome `<i>` only for `wg-icon-*` classes, and render the game-icon mask via `::before` using `currentColor`.
    - [x] Preserve the existing ornate icon frame treatment: category ACP `bgColor`/`color` still drives the frame and glyph color because the mask uses the icon element's current color; fallback styling remains faded-gold/dark-steel.
    - [x] Define the exact ACP custom classes to enter for each category/subcategory, based on `GAME_ICONS.md`, so setup can happen without theme code knowing category IDs.
    - [x] Document setup steps for admins: where to enter the custom class, which class names map to which icons, and when to rebuild/restart NodeBB after theme changes.
    - [x] Validate implementation scaffolding: `./nodebb build` succeeds, compiled templates emit `{./class}`, compiled CSS contains the `wg-icon-*` mask rules, and `/assets/plugins/nodebb-theme-westgate/game-icons/drama-masks.svg` returns HTTP 200.
    - [?] Enter the `wg-icon-*` values from `GAME_ICONS.md` into the live ACP category custom class fields. The current live data still contains legacy layout classes like `col-md-3 col-6`; keep them only if they are still intentionally used for layout, and append the `wg-icon-*` class alongside them.
      - [?] Removed `col-md-3 col-6` legacy layout classes.
      - 2026-04-23 local validation on `http://localhost:4567/categories` found the ACP data was not in the expected final state: root categories still rendered `col-md-3 col-6` and no root `wg-icon-*` classes. Re-enter the preferred classes from `GAME_ICONS.md` in this local NodeBB database before marking this complete.
    - [-] Validate actual game-icon visuals on the live website after ACP class entry: desktop and mobile `/categories`, one category page with subcategories, "load more subcategories" if present, and at least one category with no game-icon class to confirm Font Awesome fallback still works.
      - [x] Icons don't fit into their containers: either too small or cropped wrong. Especially noticeable when viewing `category` page
        - Reduced mask inset from 22% to 13%, with category header at 11% and compact child pills at 16%.
      - [x] Missing "signet ring" style ornamentation namely on `category` page (above topic or subcategory list)
        - Category page header icons now share the ornate category icon frame instead of the simpler topic-page shadow.
      - [x] Subcategory containers no longer tidy; maybe subcategory icon and container should be bigger (1.5x current size) on the `categories` page with text remaining the same size.
        - Category child pill icon frames are 27px, with fixed dimensions and unchanged text sizing.
      - [x] Some icons need to be changed. When adding new icons, add new classes for them, and deprecate unused ones:
        - [x] INFORMATION: `scroll-unfurled`
          - [x] Announcements: `trumpet-flag`
          - [x] Player Guide: `compass`
        - [x] COMMUNITY
          - [x] General Discussion:`beer-stein`
          - [x] Screenshots: `wood-frame`
          - [x] Creations: `harp`
        - [x] ROLEPLAY: `duality-mask`
          - [x] Notices: `stabbed-note`
          - [x] Rumors & Gossip: `mute`
          - [x] Journals & Biographies: `sword-altar`
          - [x] Factions & Guilds: `cowled`
            - [x] Keep `wax-seal` for "Organization Registry" (subcategory of Factions & Guilds)
        - [x] SUPPORT: `candle-flame`
          - [x] Common Issues & Questions: `key-lock`
          - [x] Feedback: `envelope`
          - [x] Technical Help:`round-potion`
        - [x] DEVELOPMENT: `anvil`
          - [x] Tools & References: `spanner`
          - [x] Programming: `gears`
          - [x] General: `wax-tablet`
          - [x] Lore: `classical-knowledge`
      - [-] CSS behavior validated with Playwright class injection because local ACP classes were missing: desktop `/categories`, mobile `/categories`, category-page header, category-page subcategory rows, and asset URLs for `scroll-unfurled.svg`, `anvil.svg`, and `candle-flame.svg` returned HTTP 200. Actual ACP-configured visual validation remains incomplete until the local category custom class fields are updated.
    - [ ] Decide whether uploaded category background images should be cleared for icon-driven categories after seeing the final ACP-configured visuals.
    - [ ] Explain any operational follow-up after ACP setup, especially asset rebuild, restart/cache behavior, and whether legacy Bootstrap layout classes should remain in category custom class fields.

Next useful moves:

Re-enter the preferred wg-icon-\* classes from GAME_ICONS.md into this local NodeBB instance, then rerun the rendered checks. Decide whether category background images should be cleared once the real ACP-configured icons are visible. Add the short operational note about rebuild/restart/cache behavior after ACP updates.

### Context for categories

Categories are fully capitalized. I've also included my own suggestions of what they could look like. If you have better ideas, tell me.

INFORMATION -- Find essential information about the server, updates, and how to get started. Could be a scroll.

- Player Guide -- A tome of knowledge, a lantern, or a candle.
- Announcements -- A bell? A town crier?
- Patch Notes -- Updates, so maybe something like a wheel?

COMMUNITY -- Out-of-character discussion and player interaction.

- General Discussion -- "Speakeasy tavern" vibe
- Introductions -- Handshake or similar.
- Screenshots -- A canvas or artpiece?
- Creations -- A lute or other instrument

ROLEPLAY -- The stories, whispers, and unfolding lives within Westgate. Definitely use a creepy mask.

- Notices -- Similar to announcemnts but these are "in-world", so may include things like... bounty posters?
- Rumors & Gossip -- A whispering person?
- Journals & Biographies -- Book or journal
- Factions & Guilds -- Wax seal or coat of arms?

SUPPORT -- Need help? Report issues, ask questions, or provide feedback here. A helping hand or a rope?

- Common Issues & Questions -- Not sure.
- Technical Help -- Something broken? A wrench? Tools?
- Bug Reports -- A bug, or something broken.
- Feedback -- Something that implies an idea

DEVELOPMENT -- Behind-the-scenes work, tools, and development discussion. Use a gear or mechanism here.

- Tools & References
- General
- Lore
- Designs
- Programming
- Area Building
