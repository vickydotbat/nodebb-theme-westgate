const assert = require("assert");
const fs = require("fs");
const path = require("path");

const stylesheet = fs.readFileSync(
	path.join(__dirname, "..", "scss", "westgate", "_wiki-prose.scss"),
	"utf8"
);

function readNumericCustomProperty(name) {
	const pattern = new RegExp(`${name}:\\s*(\\d+)\\s*;`);
	const match = stylesheet.match(pattern);
	assert(match, `Expected ${name} to be defined as a numeric custom property`);
	return Number(match[1]);
}

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

const tableHandleLayer = readNumericCustomProperty("--wiki-editor-table-handle-layer");
const toolbarLayer = readNumericCustomProperty("--wiki-editor-toolbar-layer");
const floatingToolbarLayer = readNumericCustomProperty("--wiki-editor-floating-toolbar-layer");

assert(
	tableHandleLayer < floatingToolbarLayer,
	"TipTap table resize handles must stack below content pop-out toolbars"
);
assert(
	floatingToolbarLayer < toolbarLayer,
	"Content pop-out toolbars must stack below the persistent main/table toolbar layer"
);

[
	".westgate-wiki-compose .wiki-editor__content .column-resize-handle",
	".westgate-wiki-compose .wiki-editor-table-resize-handle",
].forEach(selector => {
	assert(
		ruleHasDeclaration(selector, "z-index: var(--wiki-editor-table-handle-layer, 4)"),
		`${selector} should use the table handle stack layer`
	);
});

[
	".westgate-wiki-compose .wiki-editor__toolbar-mount",
	".westgate-wiki-compose .wiki-editor-table-sticky-row",
].forEach(selector => {
	assert(
		ruleHasDeclaration(selector, "z-index: var(--wiki-editor-toolbar-layer, 30)"),
		`${selector} should use the toolbar stack layer`
	);
});

[
	".westgate-wiki-compose .wiki-editor-context-tools",
	".westgate-wiki-compose .wiki-editor-image-tools",
	".westgate-wiki-compose .wiki-editor-table-cell-popover",
].forEach(selector => {
	assert(
		ruleHasDeclaration(selector, "z-index: var(--wiki-editor-floating-toolbar-layer, 20)"),
		`${selector} should use the floating toolbar stack layer`
	);
});
