"use strict";

const path = require("path");
const fs = require("fs");
const marked = require("marked");
const fm = require("front-matter");
const glob = require("glob");

const markedConfig = require("./marked.config.js");

function resolveContent(p) {
	return path.resolve(__dirname, "content", p);
}

function requireRaw(p) {
	return fs.readFileSync(resolveContent(p), "utf8");
}

function requireJSON(p) {
	return JSON.parse(requireRaw(p));
}

function requireMd(p, baseUrl) {
	return marked(requireRaw(p), { ...markedConfig, baseUrl });
}

function requireFmMd(p, baseUrl) {
	const { body, attributes } = fm(requireRaw(p));

	return {
		attributes,
		body: marked(body, { ...markedConfig, baseUrl })
	};
}

module.exports = {
	locals: {
		resolveContent,
		requireJSON,
		requireMd,
		requireFmMd,
		glob: (pattern, options = {}) => glob.sync(pattern, {
			...options,
			cwd: path.resolve(__dirname, "content", options.cwd || "")
		})
	}
};
