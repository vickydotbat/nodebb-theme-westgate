# Game Icons Category Stack

This theme includes a curated subset of SVGs from Game Icons for future category and subcategory icon work.

Source: https://game-icons.net and https://github.com/game-icons/icons

License: Creative Commons Attribution 3.0 Unported, https://creativecommons.org/licenses/by/3.0/

The SVGs in `public/game-icons/` were sanitized for theme use by removing the default black square background and changing the foreground fill to `currentColor`. They are used as monochrome/tintable assets, preferably in an engraved faded-gold or dark-steel treatment. Category-specific colors still come from the NodeBB ACP category color fields.

## Recommended Mapping

| Category | Recommended icon | ACP custom class | Asset |
| --- | --- | --- | --- |
| INFORMATION | Scroll and quill | `wg-icon-scroll-quill` | `public/game-icons/scroll-quill.svg` |
| Player Guide | Rule book | `wg-icon-rule-book` | `public/game-icons/rule-book.svg` |
| Announcements | Ringing bell | `wg-icon-ringing-bell` | `public/game-icons/ringing-bell.svg` |
| Patch Notes | Spinning wheel | `wg-icon-spinning-wheel` | `public/game-icons/spinning-wheel.svg` |
| COMMUNITY | Tavern sign | `wg-icon-tavern-sign` | `public/game-icons/tavern-sign.svg` |
| General Discussion | Saloon | `wg-icon-saloon` | `public/game-icons/saloon.svg` |
| Introductions | Shaking hands | `wg-icon-shaking-hands` | `public/game-icons/shaking-hands.svg` |
| Screenshots | Large paint brush | `wg-icon-large-paint-brush` | `public/game-icons/large-paint-brush.svg` |
| Creations | Flute | `wg-icon-flute` | `public/game-icons/flute.svg` |
| ROLEPLAY | Drama masks | `wg-icon-drama-masks` | `public/game-icons/drama-masks.svg` |
| Notices | Target poster | `wg-icon-target-poster` | `public/game-icons/target-poster.svg` |
| Rumors & Gossip | Chat bubble | `wg-icon-chat-bubble` | `public/game-icons/chat-bubble.svg` |
| Journals & Biographies | Notebook | `wg-icon-notebook` | `public/game-icons/notebook.svg` |
| Factions & Guilds | Wax seal | `wg-icon-wax-seal` | `public/game-icons/wax-seal.svg` |
| SUPPORT | Glowing hands | `wg-icon-glowing-hands` | `public/game-icons/glowing-hands.svg` |
| Common Issues & Questions | Question badge | `wg-icon-question` | `public/game-icons/question.svg` |
| Technical Help | Monkey wrench | `wg-icon-monkey-wrench` | `public/game-icons/monkey-wrench.svg` |
| Bug Reports | Long antennae bug | `wg-icon-long-antennae-bug` | `public/game-icons/long-antennae-bug.svg` |
| Feedback | Idea | `wg-icon-idea` | `public/game-icons/idea.svg` |
| DEVELOPMENT | Gears | `wg-icon-gears` | `public/game-icons/gears.svg` |
| Tools & References | Toolbox | `wg-icon-toolbox` | `public/game-icons/toolbox.svg` |
| General | Compass | `wg-icon-compass` | `public/game-icons/compass.svg` |
| Lore | Open book | `wg-icon-open-book` | `public/game-icons/open-book.svg` |
| Designs | Pencil ruler | `wg-icon-pencil-ruler` | `public/game-icons/pencil-ruler.svg` |
| Programming | Processor | `wg-icon-processor` | `public/game-icons/processor.svg` |
| Area Building | Castle ruins | `wg-icon-castle-ruins` | `public/game-icons/castle-ruins.svg` |

## Setup

1. In the NodeBB ACP, open `Manage > Categories`, choose a category, and put the matching `wg-icon-*` value in the category's custom class field. If that field already has layout classes such as `col-md-3 col-6`, append the icon class instead of replacing them until the layout classes are confirmed unnecessary.
2. Keep the regular ACP icon configured as a Font Awesome fallback. The theme hides it only when a matching `wg-icon-*` class is present.
3. Use the ACP text/icon color for category-specific glyph tinting. Prefer muted gold, green, blue, red, or violet accents over bright saturated colors.
4. After theme file changes, rebuild NodeBB assets and restart if the running process does not pick up `plugin.json` static directory changes.

## Attribution

The following Game Icons authors are represented in this curated set:

- Badges: `question.svg`
- Caro Asercion: `spinning-wheel.svg`
- Delapouite: `castle-ruins.svg`, `chat-bubble.svg`, `flute.svg`, `idea.svg`, `large-paint-brush.svg`, `monkey-wrench.svg`, `notebook.svg`, `pencil-ruler.svg`, `rule-book.svg`, `saloon.svg`, `scroll-quill.svg`, `shaking-hands.svg`, `target-poster.svg`, `tavern-sign.svg`, `toolbox.svg`
- Lorc: `compass.svg`, `drama-masks.svg`, `gears.svg`, `glowing-hands.svg`, `long-antennae-bug.svg`, `open-book.svg`, `processor.svg`, `ringing-bell.svg`, `wax-seal.svg`
