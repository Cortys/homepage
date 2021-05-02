"use strict";

const { AES } = require("crypto-js");
const data = require("./encrypt_data.json");

const prefix = "accept ";

console.log(`Loaded ${data.length} entries.`);
data.forEach(entry => {
	const ciphertext = AES.encrypt(prefix + JSON.stringify(entry.data), entry.key).toString();

	console.log(`${entry.name}:`);
	console.log(ciphertext);
});

console.log("Done.");
