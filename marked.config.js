"use strict";

const Prism = require("prismjs");
const loadLanguages = require("prismjs/components/");

loadLanguages(["clojure"]);

module.exports = {
	baseUrl: process.env.PUBLIC_PATH,
	highlight(code, lang) {
		return Prism.highlight(code, Prism.languages[lang], lang);
	}
};
