import { LitElement, html, css } from "lit-element";
import { classMap } from "lit-html/directives/class-map";

import "../../components/logo/LogoComponent";
import "../../components/menu/MenuComponent";
import "../../components/vortex/VortexComponent";
import { goHome, routed } from "../../router";

async function transitionEnd(el, timeout) {
	return new Promise(resolve => {
		const l = () => {
			el.removeEventListener("transitionend", l);
			resolve();
		};

		el.addEventListener("transitionend", l);

		setTimeout(resolve, timeout);
	});
}

export default class MainPage extends routed(LitElement) {
	static get properties() {
		return {
			currentLocation: { type: Object },
			withVortex: { type: Boolean },
			headComplete: { type: Boolean }
		};
	}

	constructor() {
		super();

		this.withVortex = true;
		this.headComplete = undefined;
		this.vortex = document.createElement("vortex-component");

		this.vortex.addEventListener("explosion-complete", () => this.onExplosionComplete());
	}

	static get styles() {
		return css`
			:host {
				left: 0;
				right: 0;
				height: 100vh;
				display: block;
				position: relative;
			}

			#head {
				position: fixed;
				width: 100%;
				height: 100%;
				overflow: visible;
				color: var(--white);
				background-color: rgba(21, 21, 21, 0);
				z-index: 2;
			}

			#head > *, #logo, #page slot {
				transition: all 0.5s ease-in-out;
			}

			#logo-container {
				position: absolute;
				width: 100%;
				height: 100%;
				pointer-events: none;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			#logo {
				min-width: 150px;
				min-height: 150px;
				width: 30vw;
				max-width: 460px;
				max-height: 80vh;
			}

			#title, #error {
				position: absolute;
				width: 100%;
				text-align: center;
				font-weight: inherit;
				text-shadow: var(--black-text-shadow);
				margin: 0;
				margin-bottom: 1.5em;
				bottom: 0;
				box-sizing: border-box;
				padding: 0 8px;
				cursor: default;
				opacity: 1;
				transform: translateY(-7vh);
				transition: all 0.3s ease-out;
			}

			#title {
				font-size: var(--font-h1-size);
			}

			#error {
				font-size: var(--font-h2-size);
				pointer-events: none;
				opacity: 0;
			}

			#menu {
				position: absolute;
				bottom: 0;
				transform: translateY(-7vh);
				width: 100%;
				font-size: var(--font-h3-size);
				text-shadow: var(--black-text-shadow);
				cursor: default;
				color: var(--off-white);
			}

			vortex-component {
				position: fixed;
				height: 100%;
				top: 0;
				left: 0;
				right: 0;
			}

			/* Will change: */

			#head #logo-container {
				will-change: background-color, height;
			}

			#head #logo {
				will-change: transform, width, height;
			}

			#head #title {
				will-change: transform, opacity;
			}

			#head #menu {
				will-change: transform, font-size;
			}
			#page slot {
				will-change: transform;
			}

			/* With head: */

			#head.visible {
				position: relative;
				pointer-events: none;
			}

			#head.visible > *, #head.visible #logo {
				transition-delay: 0.3s;
				pointer-events: auto;
			}

			#head.visible #logo-container {
				height: var(--head-height);
				background-color: rgba(21, 21, 21, 1);
			}

			#head.visible #logo {
				height: 100%;
				width: var(--head-height);
				cursor: pointer;
				transform: translateY(-16px);
			}

			#head.visible #title {
				transform: translateY(-40vh);
				opacity: 0;
				pointer-events: none;
			}

			#head.visible #menu {
				transform: translateY(calc(-100vh + var(--head-height) - 12px));
				font-size: var(--font-h4-size);
				text-shadow: none;
			}

			/* With error: */

			#head.error #title, #head.error #menu  {
				opacity: 0;
				pointer-events: none;
			}

			#head.error #logo-container {
				pointer-events: auto;
			}

			#head.error #logo {
				cursor: pointer;
			}

			#head.error #error {
				pointer-events: auto;
				opacity: 1;
			}

			/* Without vortex: */

			#head.complete #menu, #head.complete #logo {
				transition: none;
			}

			/* Page: */

			#page {
				position: absolute;
				top: var(--head-height);
				box-sizing: border-box;
				left: 0;
				right: 0;
				bottom: 0;
				overflow: hidden;
				z-index: 1;
			}

			#page slot {
				position: absolute;
				display: flex;
				justify-content: center;
				left: 0;
				right: 0;
				height: 100%;
				transform: translateY(100%);
			}

			#page ::slotted(*) {
				position: absolute;
			}

			#head.complete ~ #page {
				overflow: visible;
			}

			#head.visible ~ #page slot {
				transform: translateY(0%);
				transition-delay: 0.3s;
			}
		`;
	}

	get currentPageName() {
		return this.currentLocation.route.name;
	}

	get headVisible() {
		const currName = this.currentPageName;

		return currName !== "landing"
			&& currName !== "not-found";
	}

	get errorVisible() {
		return this.currentPageName === "not-found";
	}

	render() {
		const headVisible = this.headVisible;
		const headComplete = this.headComplete;
		const errorVisible = this.errorVisible;

		return html`
			${this.withVortex || !headComplete ? this.vortex : ""}
			<header id="head" class=${classMap({
				visible: headVisible,
				error: errorVisible,
				complete: headComplete
			})}>
				<div id="logo-container">
					<logo-component id="logo" @click=${goHome}></logo-component>
				</div>
				<h1 id="title">Clemens Damke</h1>
				<h2 id="error">This is not the page you are looking for.</h2>
				<menu-component id="menu"
					.currentPageName=${this.currentPageName}
					?arrows=${headComplete}
					@hovered-change=${this.onHoveredChange}></menu-component>
			</header>
			<main id="page">
				<slot></slot>
			</main>
		`;
	}

	firstUpdated() {
		this.headComplete = this.headVisible ? "initialCompletion" : false;
	}

	updated() {
		if(this.headVisible) {
			if(this.vortex.explode()) {
				const menu = this.shadowRoot.querySelector("#menu");

				if(this.headComplete !== "initialCompletion") {
					this.headComplete = undefined;
					transitionEnd(menu, 1000).then(() => {
						if(this.headComplete === undefined)
							this.headComplete = true;
					});
				}
				else {
					this.headComplete = true;
					this.vortex.initialized.then(() => this.withVortex = false);
				}
			}
		}
		else {
			this.vortex.glowDown();
			this.headComplete = false;
		}
	}

	routeChanged(location) {
		this.currentLocation = location;

		if(!this.headVisible) {
			this.withVortex = true;
			this.headComplete = false;
		}
	}

	onHoveredChange({ detail: hovered }) {
		if(this.headVisible)
			return;

		if(hovered)
			this.vortex.glowUp();
		else
			this.vortex.glowDown();
	}

	onExplosionComplete() {
		this.withVortex = false;
	}
}

window.customElements.define("main-page", MainPage);
