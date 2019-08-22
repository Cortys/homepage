import { readFileSync } from "fs";

export const prismTheme = readFileSync(`${__dirname}/../../node_modules/prismjs/themes/prism.css`, "utf8");
export const theme = readFileSync(`${__dirname}/theme.css`, "utf8");
