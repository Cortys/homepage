import { html, css } from "lit-element";
import { unsafeHTML } from "lit-html/directives/unsafe-html";
import "@polymer/iron-icon";
import "@polymer/iron-icons";
import "@lrnwebcomponents/social-media-icons";
import "@polymer/paper-button";
import "@polymer/paper-icon-button";

import ThemedElement from "../../ThemedElement";
import { goProjects, getLastClickedProject } from "../../router";
import { projects } from "./projects";

const potentialActions = {
	url: {
		label: "Show",
		icon: "open-in-new"
	},
	read: {
		label: "Read",
		icon: "description"
	},
	docs: {
		label: "Docs",
		icon: "chrome-reader-mode"
	},
	download: {
		label: "Download",
		icon: "file-download",
		target: "_self",
		download: true
	},
	repo: {
		label: "Repo",
		icon: "social-media:github"
	}
};

export default class ProjectPage extends ThemedElement {
	static get properties() {
		return {
			location: Object
		};
	}

	static get styles() {
		return [...super.styles, css`
			:host {
				max-width: var(--narrow-page-width);
			}

			header, #description, #actions {
				margin: 16px;
			}

			header {
				margin-top: 32px;
				margin-bottom: 32px;
				display: flex;
				align-items: baseline;
			}

			h2 {
				flex: 1 1;
				margin: 0;
			}

			#name {
				width: 0;
				text-overflow: ellipsis;
				overflow: hidden;
			}

			#year, #back {
				flex: 0 0 auto;
				overflow: hidden;
				display: flex;
				align-items: center;
			}

			#back paper-icon-button {
				display: inline;
				position: relative;
				font-size: var(--font-base-size);
				margin-right: 4px;
			}

			#year span {
				font-size: var(--font-base-size);
				flex: 0 0;
				background-color: var(--beige);
				color: var(--white);
				padding: 4px 8px;
				border-radius: 2px;
				margin-left: 4px;
			}

			#description img {
				max-width: 100%;
			}

			#mainImg {
				display: flex;
				justify-content: center;
				margin: 16px;
			}

			#mainImg > img {
				display: block;
				max-width: 100%;
				max-height: 100vh;
			}

			#mainImg[vec] > img {
				width: 100%;
			}

			#actions {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				justify-content: center;
				margin: 12px;
			}

			#actions a {
				text-decoration: none;
				margin: 4px;
			}

			#actions paper-button {
				padding: 8px 16px;
				font-weight: 300 !important;
				margin: 0;
				border: 1px solid transparent;
				transition: 0.05s border-color ease-in-out;
			}

			#actions paper-button:hover, #actions paper-button.keyboard-focus {
				border: 1px solid var(--beige);
			}

			#actions iron-icon {
				width: 1em;
				height: 1em;
				margin-right: 6px;
			}
		`];
	}

	get project() {
		return projects.get(this.location.params.id);
	}

	render() {
		const project = this.project;
		const mainImgPath = project.mainImgPath
			|| project.bannerImgPath && project.bannerImgPath.endsWith(".svg") && project.bannerImgPath;

		return html`
			<div id="project">
				<header>
					<h2 id="back">&#8203;<paper-icon-button icon="arrow-back" @click=${this.backClicked}></paper-icon-button></h2>
					<h2 id="name">${project.name}</h2>
					<h2 id="year">&#8203;<span>${project.year}</span></h2>
				</header>
				${mainImgPath
					? html`<figure id="mainImg" ?vec=${mainImgPath.endsWith(".svg")}><img src=${mainImgPath} alt=""></figure>`
					: ""}
				<div id="actions">
					${Object.keys(potentialActions)
						.filter(key => project[key])
						.map(key => {
							const { label, icon, target, download } = potentialActions[key];

							return html`<a href=${project[key]} target=${target || "_blank"} tabindex="-1" ?download=${download}><paper-button><iron-icon icon=${icon}></iron-icon>${label}</paper-button></a>`;
						})}
				</div>
				<article id="description">${unsafeHTML(project.description)}</article>
			</div>
		`;
	}

	onBeforeEnter() {
		const lastClickedProject = getLastClickedProject();

		if(lastClickedProject)
			this.scrollUp = true;
	}

	onAfterEnter() {
		if(!this.scrollUp)
			return;

		this.scrollUp = false;
		window.scrollTo({ top: 0 });
		window.history.replaceState({
			cameFromProjects: true
		}, document.title, window.location);
	}

	backClicked() {
		if(window.history.state && window.history.state.cameFromProjects)
			window.history.back();
		else
			goProjects();
	}
}

window.customElements.define("project-page", ProjectPage);
