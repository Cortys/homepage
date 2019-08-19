import { LitElement, html, css } from "lit-element";
import { classMap } from "lit-html/directives/class-map";

import "../../components/logo/LogoComponent";
import "../../components/VortexComponent";
import "../../components/MenuComponent";
import { goHome, routed } from "../../router";

export default class MainPage extends routed(LitElement) {
	static get properties() {
		return {
			currentLocation: { type: Object },
			withVortex: { type: Boolean }
		};
	}

	constructor() {
		super();

		this.withVortex = true;
		this.vortex = document.createElement("vortex-component");

		this.vortex.addEventListener("explosion-complete", () => this.onExplosionComplete());
	}

	static get styles() {
		return css`
			:host {
				min-width: 100%;
				height: 100%;
				display: block;
			}

			#head {
				position: fixed;
				width: 100%;
				height: 100%;
				overflow: visible;
				color: var(--white);
				background-color: rgba(21, 21, 21, 0);
			}

			#head, #head > *, #logo {
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

			#vortex {
				position: fixed;
				height: 100%;
				top: 0;
				left: 0;
			}

			/* Will change: */
			#head {
				will-change: height, background-color;
			}

			#head #logo-container {
				will-change: transform, width, height;
			}

			#head #logo {
				will-change: width, height;
			}

			#head #title {
				will-change: transform, opacity;
			}

			#head #menu {
				will-change: transform, font-size;
			}

			/* With head: */

			#head.visible {
				position: relative;
				height: 160px;
				background-color: rgba(21, 21, 21, 1);
			}

			#head.visible, #head.visible > *, #head.visible #logo {
				transition-delay: 0.3s;
			}

			#head.visible #logo-container {
				transform: translateY(-16px);
				pointer-events: auto;
			}

			#head.visible #logo {
				height: 100%;
				width: 160px;
				cursor: pointer;
			}

			#head.visible #title {
				transform: translateY(-20vh);
				opacity: 0;
				pointer-events: none;
			}

			#head.visible #menu {
				transform: translateY(-12px);
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
		`;
	}

	get headVisible() {
		const currName = this.currentLocation.route.name;

		return currName !== "landing"
			&& currName !== "not-found";
	}

	get errorVisible() {
		return this.currentLocation.route.name === "not-found";
	}

	render() {
		const headVisible = this.headVisible;
		const errorVisible = this.errorVisible;

		return html`
			${this.withVortex ? this.vortex : ""}
			<header id="head" class=${classMap({
				visible: headVisible,
				error: errorVisible
			})}>
				<div id="logo-container">
					<logo-component id="logo" @click=${goHome}></logo-component>
				</div>
				<h1 id="title">Clemens Damke</h1>
				<h2 id="error">This is not the page you are looking for.</h2>
				<menu-component id="menu"
					@hovered-change=${this.onHoveredChange}></menu-component>
			</header>
			<main id="page">
				<slot></slot>
			</main>
		`;
	}

	updated() {
		if(this.headVisible)
			this.vortex.explode();
		else
			this.vortex.glowDown();
	}

	routeChanged(location) {
		this.currentLocation = location;

		if(!this.headVisible)
			this.withVortex = true;
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