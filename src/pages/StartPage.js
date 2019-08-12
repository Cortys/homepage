import { LitElement, html } from "lit-element";
import "../components/logo/LogoComponent";
import "../components/VortexComponent";
import "../components/MenuComponent";

export default class StartPage extends LitElement {
	render() {
		return html`
			<style>
				:host {
					min-width: 100%;
					height: 100%;
					display: block;
				}

				vortex-component, #logo-container {
					position: fixed;
					width: 100%;
					height: 100%;
					top: 0;
					left: 0;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				logo-component {
					min-width: 150px;
					min-height: 150px;
					width: 30vw;
					max-width: 460px;
					max-height: 80vh;
				}

				menu-component {
					position: fixed;
					text-align: center;
					width: 100%;
					bottom: 100px;
					cursor: default;
				}
			</style>
			<vortex-component></vortex-component>
			<div id="logo-container">
				<logo-component></logo-component>
			</div>
			<menu-component></menu-component>
		`;
	}
}

window.customElements.define("start-page", StartPage);
