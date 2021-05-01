import { LitElement, html, css } from "lit";

import logoURL from "./logo.svg";

const isTouch = "ontouchstart" in window || navigator.msMaxTouchPoints > 0;
const downEvent = isTouch ? "touchstart" : "mousedown";

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
				-webkit-tap-highlight-color: rgba(0,0,0,0);
			    -webkit-tap-highlight-color: transparent;
			}

			#logo {
				display: flex;
				position: relative;
				width: 100%;
				height: 100%;
				animation: logoPulse 10s ease-in-out infinite alternate;
				will-change: transform;
				overflow: hidden;
				user-select: none;
				align-items: center;
				justify-content: center;
			}

			#front, #back {
				position: absolute;
				will-change: transform;
				pointer-events: none;
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

			#hit {
				position: relative;
				width: 50%;
				padding-top: 50%;
				border-radius: 50%;
			}
		`;
	}

	constructor() {
		super();

		this.smashAnim = null;
	}

	render() {
		return html`
			<div id="logo">
				<img id="back" src="${logoURL}" alt="" draggable="false">
				<img id="front" src="${logoURL}" alt="" draggable="false">
				<div id="hit"></div>
			</div>
		`;
	}

	updated() {
		this.shadowRoot.querySelector("#hit").addEventListener(downEvent, e => this.onDown(e));
	}

	onDown() {
		this.dispatchEvent(new CustomEvent("down"));
	}

	smashDown() {
		let startScale = 1;

		if(this.smashAnim != null) {
			const transformMatrix = window.getComputedStyle(this).transform;

			if(transformMatrix)
				startScale = +transformMatrix.match(/\d+(\.\d+)?/)[0] || 1;

			this.smashAnim.cancel();
		}

		const smashAnim = this.smashAnim = this.animate([{
			transform: `scale(${startScale})`,
			easing: "cubic-bezier(0.55, 0, 1, 0.45)"
		}, {
			transform: "scale(0.7)"
		}], {
			direction: "normal",
			iterations: 1,
			duration: 300
		});

		const backupAnim = smashAnim.finished.then(() => {
			const anim = this.smashAnim = this.animate([{
				transform: "scale(0.7)",
				easing: "cubic-bezier(0, 0.55, 0.45, 1)"
			}, {
				transform: "scale(1)"
			}], {
				direction: "normal",
				iterations: 1,
				duration: 600
			});

			return anim.finished;
		}).catch(() => {}).finally(() => this.smashAnim = null);

		return {
			smash: smashAnim.finished,
			backup: backupAnim
		};
	}
}

window.customElements.define("logo-component", LogoComponent);
