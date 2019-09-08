import { html, css } from "lit-element";

import ThemedElement from "../../ThemedElement";

export default class ProjectPage extends ThemedElement {
	static get properties() {
		return {
			location: Object
		};
	}

	static get styles() {
		return [...super.styles, css`

		`];
	}

	render() {
		console.log(this.location.params.id);

		return html`

		`;
	}
}

window.customElements.define("project-page", ProjectPage);
