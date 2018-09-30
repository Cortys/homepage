import { LitElement, html } from "@polymer/lit-element";
import "../components/logo/LogoComponent";
import "../components/GraphComponent";

export default class StartPage extends LitElement {
	_render() {
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

				#title {
					position: fixed;
					text-align: center;
					width: 100%;
					bottom: 40px;
					cursor: default;
				}
			</style>
			<graph-component></graph-component>
			<logo-component></logo-component>
			<div id="title">Content soon(ish)&hellip; Maybe.</div>
		`;
	}
}

window.customElements.define("start-page", StartPage);
