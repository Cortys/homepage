import { html, css } from "lit-element";

import ThemedElement from "../../ThemedElement";
import gif from "./construction.gif";

export default class ProjectsPage extends ThemedElement {
	static get styles() {
		return [...super.styles, css`
			:host {
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-direction: column;
			}

			img {
				max-width: 20vmin;
				image-rendering: pixelated;
				margin: 16px;
			}
		`];
	}

	render() {
		return html`
			<img src=${gif} alt="">
			<h2>Coming soon(ish)™.</h2>
		`;
	}
}

window.customElements.define("projects-page", ProjectsPage);
