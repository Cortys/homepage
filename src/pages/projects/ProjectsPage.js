import { LitElement, html } from "lit-element";

export default class ProjectsPage extends LitElement {
	render() {
		return html`
			Hello World!
		`;
	}
}

window.customElements.define("projects-page", ProjectsPage);
