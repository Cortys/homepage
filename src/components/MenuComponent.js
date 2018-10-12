import { LitElement, html } from "@polymer/lit-element";

class MenuComponent extends LitElement {
	render() {
		return html`
			<style>
				a {
					color: #ffffff;
					text-decoration: none;
					font-weight: bold;
				}
			</style>

			<a href="javascript:alert('Coming soon(ish)™.')">About</a>
			&middot;
			<a href="javascript:alert('Coming soon(ish)™.')">Portfolio</a>
			&middot;
			<a href="https://github.com/Cortys" target="_blank">GitHub</a>
		`;
	}
}

window.customElements.define("menu-component", MenuComponent);
