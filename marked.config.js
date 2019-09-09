"use strict";

const Prism = require("prismjs");
const loadLanguages = require("prismjs/components/");

loadLanguages(["clojure"]);

module.exports = {
	smartypants: true,
	highlight(code, lang) {
		return Prism.highlight(code, Prism.languages[lang], lang);
	}
};
