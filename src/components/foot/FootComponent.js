import { LitElement, html, css } from "lit";

import footer from "./footer.svg";

class FootComponent extends LitElement {
	static get styles() {
		return css`
			#foot {
				display: flex;
				justify-content: center;
				margin: 64px;
				-webkit-tap-highlight-color: rgba(0,0,0,0);
			    -webkit-tap-highlight-color: transparent;
			}

			#foot img {
				cursor: pointer;
				transition: transform 0.22s ease-in-out;
			}

			#foot img:hover {
				transform: rotate(360deg);
			}

			#foot img:active {
				transform: rotate(360deg) scale(0.9);
			}
		`;
	}

	render() {
		return html`
			<div id="foot">
				<img src="${footer}" alt="" @click=${() => window.scrollTo({ top: 0, behavior: "smooth" })} title="Back to top">
			</div>
		`;
	}
}

window.customElements.define("foot-component", FootComponent);
