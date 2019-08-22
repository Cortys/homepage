import { html, css } from "lit-element";
import { unsafeHTML } from "lit-html/directives/unsafe-html";

import description from "content/about/description.md";
import ThemedElement from "../../ThemedElement";

const mail = ["clemens", "cortys.de"].join("@");

export default class AboutPage extends ThemedElement {
	static get styles() {
		return [...super.styles, css`
			:host {
				display: flex;
				flex-direction: column;
				height: 100%;
				align-items: center;
				box-sizing: border-box;
			}

			#about {
				width: var(--narrow-page-width);
				max-width: 100%;
				flex-grow: 1;
				display: flex;
				align-items: center;
				line-height: 150%;
			}

			#about > * {
				margin: 16px;
			}

			#desc {
				flex: 1;
			}
			#contact {
				flex: 1;
			}
		`];
	}

	render() {
		return html`
			<div id="about">
				<div id="desc">
					${unsafeHTML(description)}
				</div>
				<div id="contact">
					E-Mail: <a href="mailto:${mail}">${mail}</a><br>
					GitHub: <a href="https://github.com/Cortys">Cortys</a><br>
					Twitter: <a href="https://twitter.com/Cortosien">@Cortosien</a>
				</div>
			</div>
		`;
	}
}

window.customElements.define("about-page", AboutPage);
