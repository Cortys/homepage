import { LitElement, html, css } from "lit-element";

import logoURL from "./logo.svg";

class LogoComponent extends LitElement {
	static get styles() {
		return css`
			@keyframes logoPulse {
				from {
					transform: scale(1);
				}
				to {
					transform: scale(1.15);
				}
			}

			@keyframes logoRotate {
				from {
					transform: rotate(0deg);
				}
				to {
					transform: rotate(360deg);
				}
			}

			:host {
				display: block;
				width: 460px;
				height: 460px;
				overflow: hidden;
			}

			#logo {
				display: block;
				position: relative;
				width: 100%;
				height: 100%;
				animation: logoPulse 10s ease-in-out infinite alternate;
				will-change: transform;
				overflow: hidden;
				pointer-events: none;
				user-select: none;
			}

			#front, #back {
				position: absolute;
				will-change: transform;
			}

			#front {
				top: 25%;
				left: 25%;
				width: 50%;
				height: 50%;
				animation: logoRotate 40s linear infinite;
			}

			#back {
				top: 24%;
				left: 24%;
				width: 52%;
				height: 52%;
				opacity: 0.5;
				animation: logoRotate 20s linear infinite reverse;
			}
		`;
	}

	render() {
		return html`
			<div id="logo">
				<img id="back" src="${logoURL}">
				<img id="front" src="${logoURL}">
			</div>
		`;
	}
}

window.customElements.define("logo-component", LogoComponent);
