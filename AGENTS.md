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

Reference prior theme work in this repo through files prefixed with `____`:

- `____live-copy.css`
- `____wikijs-live-copy.scss`
- `____bootstrap-overrides.scss`

`____live-copy.css` is the clearest reference for the intended slick gradient treatment. Use that direction for foreground elements such as panels, topic rows, buttons, borders, accents, and active states. Keep gradients rich and polished, but avoid turning the entire page into a decorative gradient background.

When adding new visuals, study the `____` reference files first and match the existing direction before introducing new motifs.

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

- [x] Remove the lines on the left side of the categories page underneath the categories this also exists for subcategories on the "category" page.

## Future Tasks

Tasks to be considered in the future, not implemented immediately. Keep them in scope when making decisions.

- [x] Draft a design for icons and avatars to look a little more "ornate", like literal signet rings, maybe with some subtle dark steel or faded gold bordering. Implemented with layered dark steel/faded gold borders and restrained inset highlights for category icons, child category icons, avatars, and user initials. `./nodebb build` passes; local browser validation was blocked because `localhost:4567` was not running.

- [ ] Consider a light mode/dark mode toggle while retaining core theme, preferably without adding a Skin
- [ ] Un-bold "topics" and "posts" and make the color lines replace the black line drived from category background color to either use the foreground color of the icon, or an ornate gilding like the icons (image 2)
- [ ] Consider making the category names a bit smoother; it looks like it's not anti-aliased. (image 3)
- [ ] Mobile website doesn't use the correct fonts.
