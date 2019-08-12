import { LitElement, html, css } from "lit-element";
import "../components/logo/LogoComponent";
import "../components/VortexComponent";
import "../components/MenuComponent";
import theme from "../styles/theme.scss";

console.log(theme);

export default class StartPage extends LitElement {
	static get styles() {
		return css`
			:host {
				min-width: 100%;
				height: 100%;
				display: block;
			}

			#vortex, #logo-container {
				position: fixed;
				width: 100%;
				height: 100%;
				top: 0;
				left: 0;
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

			#title {
				position: fixed;
				text-align: center;
				width: 100%;
				bottom: 7vh;
				font-size: var(--font-h1-size);
				font-weight: inherit;
				margin: 0;
				margin-bottom: 1.5em;
				cursor: default;
			}

			#menu {
				position: fixed;
				text-align: center;
				width: 100%;
				bottom: 7vh;
				font-size: var(--font-h3-size);
				cursor: default;
				color: var(--off-white);
			}
		`;
	}

	render() {
		return html`
			<vortex-component id="vortex"></vortex-component>
			<div id="logo-container">
				<logo-component id="logo"></logo-component>
			</div>
			<h1 id="title">Clemens Damke</h1>
			<menu-component id="menu"></menu-component>
		`;
	}
}

window.customElements.define("start-page", StartPage);
