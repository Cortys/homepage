import { LitElement, html } from "lit-element";

class MenuComponent extends LitElement {
	render() {
		return html`
			<style>
				a {
					position: relative;
					display: inline-block;
					color: #ffffff;
					text-decoration: none;
					font-weight: bold;
					margin: 0 8px;
					transition: 0.1s all ease-in-out;
					transform: scale(1);
				}

				a:hover {
					transform: scale(1.07) translateY(-2px);

				}
			</style>

			<a href="javascript:alert('Coming soon(ish)™.')">About</a>
			&middot;
			<a href="javascript:alert('Coming soon(ish)™.')">Portfolio</a>
			&middot;
			<a href="https://github.com/Cortys">GitHub</a>
		`;
	}
}

window.customElements.define("menu-component", MenuComponent);
