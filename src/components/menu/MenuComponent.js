import fs from "fs";
import { LitElement, html, css, unsafeCSS } from "lit-element";
import { classMap } from "lit-html/directives/class-map";

import { menuEntries, router } from "../../router";

const triangle = `data:image/svg+xml;utf8,${encodeURIComponent(fs.readFileSync(`${__dirname}/triangle.svg`, "utf8"))}`;

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
			}

			a span {
				display: block;
				transition: 0.1s all ease-in-out;
				text-rendering: optimizeLegibility;
			}

			a:not(.active) span:hover {
				color: var(--white);
				text-shadow: 0px -2px 8px var(--off-white);
			}

			a.active span {
				color: var(--bright-red);
				transform: scale(1.1);
			}

			a::after {
				position: absolute;
				display: block;
				width: 16px;
				height: 8px;
				background: url('${unsafeCSS(triangle)}');
				top: 100%;
				left: calc(50% - 8px);
				content: '';
				transform: translateY(0px);
				transition: 0.1s transform ease-in-out;
				pointer-events: none;
			}

			a.active::after {
				transform: translateY(12px);
			}

			:host(:not([arrows])) a::after {
				opacity: 0;
				transform: translateY(0px);
			}
		`;
	}

	render() {
		return html`
			${menuEntries.filter(entry => !entry.hidden).map(({ name }) => html`
				<a href="${router.urlForName(name)}" class=${classMap({
					active: this.currentPageName === name
				})}><span>${name}</span></a>
				&middot;
			`)}
			<a href="https://github.com/Cortys"><span>GitHub</span></a>
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
