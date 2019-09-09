import { html, css } from "lit-element";
import { unsafeHTML } from "lit-html/directives/unsafe-html";
import "@polymer/iron-icon";
import "@polymer/iron-icons";
import "@lrnwebcomponents/social-media-icons";

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
				line-height: 1.8 !important;
			}

			#about {
				width: var(--narrow-page-width);
				max-width: 100%;
				flex-grow: 1;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;
			}

			#about > * {
				margin: 16px;
			}

			#desc {
				flex: 2;
				max-width: 600px;
			}

			#contact {
				flex: 1;
				display: grid;
				grid-template-columns: auto auto 1fr;
				grid-gap: 4px 8px;
				align-items: center;
				--iron-icon-width: 1em;
				--iron-icon-height: 1em;
			}

			@media (max-width: 600px), (orientation: portrait) {
				#about {
					flex-direction: column;
				}

				#desc {
					flex: 0;
				}

				#contact {
					flex: 0;
				}
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
					<iron-icon icon="mail"></iron-icon><span>E-Mail:</span><a href="mailto:Clemens%20Damke<${mail}>">${mail}</a>
					<iron-icon icon="social-media:github"></iron-icon><span> GitHub:</span><a href="https://github.com/Cortys">Cortys</a>
					<iron-icon icon="social-media:twitter"></iron-icon><span> Twitter:</span><a href="https://twitter.com/Cortosien">@Cortosien</a>
				</div>
			</div>
		`;
	}
}

window.customElements.define("about-page", AboutPage);
