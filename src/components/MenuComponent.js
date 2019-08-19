import { LitElement, html, css } from "lit-element";
import { classMap } from "lit-html/directives/class-map";

import { menuEntries, router } from "../router";

class MenuComponent extends LitElement {
	constructor() {
		super();

		this.addEventListener("mouseover", e => this.onMouseEvent(e), { passive: true });
		this.addEventListener("mouseout", e => this.onMouseEvent(e), { passive: true });
		this.addEventListener("mousemove", e => this.onMouseEvent(e), { passive: true });

		this.hovered = false;
	}

	static get properties() {
		return {
			hovered: { type: Boolean },
			currentPageName: { type: String }
		};
	}

	static get styles() {
		return css`
			:host {
				display: flex;
				justify-content: center;
				align-items: center;
				text-align:center;
			}

			a {
				position: relative;
				display: inline-block;
				color: inherit;
				text-decoration: none;
				margin: 0 12px;
				transition: 0.1s all ease-in-out;
			}

			a:not(.active):hover {
				color: var(--white);
				text-shadow: 0px -2px 8px var(--off-white);
			}

			a.active {
				color: var(--bright-red);
				transform: scale(1.1);
			}
		`;
	}

	render() {
		return html`
			${menuEntries.map(({ name }) => html`
				<a href="${router.urlForName(name)}" class=${classMap({
					active: this.currentPageName === name
				})}>${name}</a>
				&middot;
			`)}
			<a href="https://github.com/Cortys">GitHub</a>
		`;
	}

	onMouseEvent() {
		const hovered = this.shadowRoot.querySelector("a:hover") != null;
		const oldHovered = this.hovered;

		if(hovered === oldHovered)
			return;

		this.hovered = hovered;

		this.dispatchEvent(new CustomEvent("hovered-change", {
			detail: hovered,
			composed: true
		}));
	}
}

window.customElements.define("menu-component", MenuComponent);
