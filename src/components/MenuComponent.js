import { LitElement, html, css } from "lit-element";

class MenuComponent extends LitElement {
	static get styles() {
		return css`
			a {
				position: relative;
				display: inline-block;
				color: inherit;
				text-decoration: none;
				margin: 0 8px;
				transition: 0.2s all var(--ease-out-back);
				transform: scale(1);
				transform-origin: 50% 100%;
			}

			a:hover {
				transform: scale(1.1);

			}
		`;
	}

	render() {
		return html`
			<a href="javascript:alert('Coming soon(ish)™.')">About</a>
			&middot;
			<a href="javascript:alert('Coming soon(ish)™.')">Projects</a>
			&middot;
			<a href="https://github.com/Cortys">GitHub</a>
		`;
	}
}

window.customElements.define("menu-component", MenuComponent);
