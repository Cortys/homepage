import { LitElement, html } from "@polymer/lit-element";
import "../components/logo/LogoComponent";
import "../components/GraphComponent";
import "../components/MenuComponent";

export default class StartPage extends LitElement {
	render() {
		return html`
			<style>
				:host {
					min-width: 100%;
					height: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
				}

				graph-component {
					position: fixed;
					width: 100%;
					height: 100%;
					top: 0;
					left: 0;
				}

				logo-component {
					min-width: 150px;
					min-height: 150px;
					width: 30vw;
					max-width: 460px;
					max-height: 100vh;
				}

				menu-component {
					position: fixed;
					text-align: center;
					width: 100%;
					bottom: 100px;
					cursor: default;
				}
			</style>
			<graph-component></graph-component>
			<logo-component></logo-component>
			<menu-component></menu-component>
		`;
	}
}

window.customElements.define("start-page", StartPage);
