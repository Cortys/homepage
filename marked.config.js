"use strict";

const path = require("path");
const marked = require("marked");
const Prism = require("prismjs");
const loadLanguages = require("prismjs/components/");

loadLanguages(["clojure"]);

const renderer = new marked.Renderer();
const blankMarker = ";blank";
const baseUrl = process.env.PUBLIC_PATH || "/";

renderer.link = function(href, title, text) {
	const blank = href.endsWith(blankMarker);
	let link;

	if(blank)
		href = href.substr(0, href.length - blankMarker.length);

	if(href.startsWith("/"))
		link = marked.Renderer.prototype.link.call(this, path.join(baseUrl, href), title, text);
	else
		link = marked.Renderer.prototype.link.call(this, href, title, text);

	if(blank)
		link = link.replace("<a", "<a target='_blank'");

	return link;
};

module.exports = {
	// Parcel clones the renderer. This would remove the overridden link method.
	// It is prevented by moving the override up the prototype chain, which is left untouched by the cloner:
	renderer: Object.create(renderer),
	smartypants: true,
	highlight(code, lang) {
		return Prism.highlight(code, Prism.languages[lang], lang);
	}
};
