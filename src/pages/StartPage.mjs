import { LitElement, html } from "@polymer/lit-element";
import "../components/logo/LogoComponent";

export default class StartPage extends LitElement {
	_render() {
		return html`
			<style>
				:host {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					min-width: 100%;
					height: 100%;
					cursor: default;
				}
			</style>
			<logo-component></logo-component>
			Relaunching soon...
		`;
	}
}

window.customElements.define("start-page", StartPage);
