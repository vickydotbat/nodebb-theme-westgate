const assert = require("assert");
const fs = require("fs");
const path = require("path");

const stylesheet = fs.readFileSync(
	path.join(__dirname, "..", "scss", "westgate", "_wiki-prose.scss"),
	"utf8"
);

function ruleHasDeclaration(selector, declaration) {
	const rulePattern = /([^{}]+)\{([^{}]*)\}/g;
	let match;
	while ((match = rulePattern.exec(stylesheet)) !== null) {
		const selectors = match[1].split(",").map(value => value.trim());
		const body = match[2];
		if (selectors.includes(selector) && body.includes(declaration)) {
			return true;
		}
	}
	return false;
}

assert(
	ruleHasDeclaration(".westgate-wiki .wiki-breadcrumb-trail__action", "padding-left: 12px"),
	"Wiki edit action should keep the same left-side separator spacing as breadcrumb items"
);

[
	"--wiki-breadcrumb-color: color-mix(in srgb, var(--wg-text-muted) 68%, transparent)",
	"font-family: var(--wg-font-display)",
	"font-size: 0.875rem",
	"gap: 0",
	"font-weight: 600",
	"letter-spacing: 0",
	"text-transform: none",
].forEach(declaration => {
	assert(
		ruleHasDeclaration(".westgate-wiki .wiki-breadcrumb-trail", declaration),
		`Wiki breadcrumbs should inherit regular forum breadcrumb typography: ${declaration}`
	);
});

assert(
	ruleHasDeclaration(".westgate-wiki .wiki-breadcrumb-trail__list", "gap: 0"),
	"Wiki breadcrumbs should use Bootstrap breadcrumb spacing instead of a custom flex gap"
);

assert(
	ruleHasDeclaration(".westgate-wiki .wiki-breadcrumb-trail__item:not(:last-child)::after", "content: none"),
	"Wiki breadcrumbs should suppress the plugin slash divider"
);

assert(
	ruleHasDeclaration(".westgate-wiki .wiki-breadcrumb-trail__item + .wiki-breadcrumb-trail__item::before", "content: \"→\""),
	"Wiki breadcrumbs should use the same arrow divider as regular forum breadcrumbs"
);

[
	".westgate-wiki .wiki-breadcrumb-trail__link",
	".westgate-wiki .wiki-breadcrumb-trail__text",
	".westgate-wiki .wiki-breadcrumb-trail__text--current",
	".westgate-wiki .wiki-breadcrumb-trail__action",
].forEach(selector => {
	assert(
		ruleHasDeclaration(selector, "color: var(--wiki-breadcrumb-color)"),
		`${selector} should use the dimmed forum breadcrumb color`
	);
	assert(
		ruleHasDeclaration(selector, "font-family: var(--wg-font-display)"),
		`${selector} should explicitly use the forum breadcrumb display font`
	);
});
