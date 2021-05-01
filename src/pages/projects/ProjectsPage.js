import { html, css } from "lit";

import ThemedElement from "../../ThemedElement";
import "../../components/project/ProjectComponent";
import { projectsArray } from "./projects";

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
			<foot-component></foot-component>
		`;
	}
}

window.customElements.define("projects-page", ProjectsPage);
