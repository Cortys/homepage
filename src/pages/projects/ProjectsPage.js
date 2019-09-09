import { html, css } from "lit-element";

import ThemedElement from "../../ThemedElement";
import "../../components/project/ProjectComponent";
import { projectsArray } from "./projects";
import footer from "./footer.svg";

export default class ProjectsPage extends ThemedElement {
	static get styles() {
		return [...super.styles, css`
			:host {
				max-width: var(--page-width);
			}

			#projects {
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				align-items: flex-start;
				justify-content: center;
				margin: 8px 0;
			}

			#projects > * {
				margin: 8px;
				min-width: 240px;
				width: calc(33% - 16px);
				max-width: calc(var(--page-width) / 3 - 16px);
				flex: 1 0 auto;
			}

			#projects > .dummy {
				height: 0;
				margin: 0 8px;
			}

			#foot {
				display: flex;
				justify-content: center;
				margin: 64px;
			}

			#foot img {
				cursor: pointer;
			}
		`];
	}

	render() {
		return html`
			<div id="projects">
				${projectsArray.map(project => html`
					<project-component id=${project.id} .project=${project}></project-component>
				`)}
				${projectsArray.length > 2 ? html`<div class="dummy"></div><div class="dummy"></div>` : ""}
			</div>
			<div id="foot">
				<img src="${footer}" alt="" @click=${() => window.scrollTo({ top: 0, behavior: "smooth" })} title="Back to top">
			</div>
		`;
	}
}

window.customElements.define("projects-page", ProjectsPage);
