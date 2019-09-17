"use strict";

const marked = require("marked");
const Prism = require("prismjs");
const loadLanguages = require("prismjs/components/");

loadLanguages(["clojure"]);

const renderer = new marked.Renderer();
const blankMarker = ";blank";

renderer.link = function(href, title, text) {
	if(!href.endsWith(blankMarker))
		return marked.Renderer.prototype.link.call(this, href, title, text);

	const link = marked.Renderer.prototype.link.call(this,
		href.substr(0, href.length - blankMarker.length), title, text);

	return link.replace("<a", "<a target='_blank'");
};

module.exports = {
	renderer,
	smartypants: true,
	highlight(code, lang) {
		return Prism.highlight(code, Prism.languages[lang], lang);
	}
};
