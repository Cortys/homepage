import { LitElement, html } from "@polymer/lit-element";

import logoURL from "./logo.svg";

class LogoComponent extends LitElement {
	_render() {
		return html`
			<style>
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
					animation: logoPulse 5s cubic-bezier(.87,-.41,.19,1.44) infinite alternate;
					will-change: transform;
					overflow: hidden;
					pointer-events: none;
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
					animation: logoRotate 5s linear infinite;
				}

				#back {
					top: 24%;
					left: 24%;
					width: 52%;
					height: 52%;
					opacity: 0.5;
					animation: logoRotate 5s linear infinite reverse;

				}
			</style>
			<div id="logo">
				<img id="back" src="${logoURL}">
				<img id="front" src="${logoURL}">
			</div>
		`;
	}
}

window.customElements.define("logo-component", LogoComponent);
