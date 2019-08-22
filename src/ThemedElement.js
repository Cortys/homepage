import { LitElement, unsafeCSS } from "lit-element";
import { theme, prismTheme } from "./styles/theme";

export default class ThemedElement extends LitElement {
	static get styles() {
		return [unsafeCSS(theme), unsafeCSS(prismTheme)];
	}
}
