import { html, css } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html";
import { Utf8 } from "crypto-es/lib/core";
import { AES } from "crypto-es/lib/aes";
import "@polymer/iron-icon";
import "@polymer/iron-icons";
import "@polymer/iron-icons/av-icons";
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
	presentation: {
		label: "Presentation",
		icon: "av:movie"
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
	},
	blog: {
		label: "Blog",
		icon: "description"
	},
	unlock: {
		label: "Unlock Content",
		icon: "lock-outline"
	}
};
const unlockPrefix = "accept ";

export default class ProjectPage extends ThemedElement {
	static get properties() {
		return {
			location: Object,
			unlocking: Boolean,
			unlockedContent: Object
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

			#actions > a, #actions > span {
				text-decoration: none;
				margin: 4px;
			}

			#actions paper-button {
				padding: 8px 16px;
				font-weight: 300 !important;
				margin: 0;
				border: 1px solid transparent;
				transition: 0.05s border-color ease-in-out;
				color: var(--red);
				height: 40px;
			}

			#answer {
				display: block;
				box-sizing: border-box;
				padding: 8px 16px;
				border: 1px solid var(--beige);
				border-radius: 3px;
				height: 40px;
				outline: none;
			}

			#answer:focus {
				border-color: var(--red);
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
		let project = projects.get(this.location.params.id);

		if(this.unlockedContent != null)
			project = {
				...project,
				...this.unlockedContent,
				unlock: undefined
			};

		return project;
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
					${this.unlocking ? html`
						<span>${project["unlock-question"]}</span>
						<span><input type="text" id="answer" @input=${this.checkAnswer}></span>
					` : Object.keys(potentialActions)
						.filter(key => project[key])
						.map(key => {
							const { label, icon, target, download } = potentialActions[key];

							if(key === "unlock")
								return html`
									<span @click=${this.unlockContent}><paper-button><iron-icon icon=${icon}></iron-icon>${label}</paper-button></span>
								`;

							return html`<a href=${project[key]} target=${target || "_blank"} tabindex="-1" ?download=${download}><paper-button><iron-icon icon=${icon}></iron-icon>${label}</paper-button></a>`;
						})}
				</div>
				<article id="description">${unsafeHTML(project.description)}</article>
			</div>
			<foot-component></foot-component>
		`;
	}

	updated() {
		if(this.unlocking) {
			this.shadowRoot.querySelector("#answer").focus();
		}
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

	unlockContent() {
		this.unlocking = true;
	}

	checkAnswer() {
		const answer = this.shadowRoot.querySelector("#answer").value.trim().toLowerCase();

		try {
			const decrypted = AES.decrypt(this.project.unlock, answer).toString(Utf8);

			if(!decrypted.startsWith(unlockPrefix))
				return;

			this.unlocking = false;
			this.unlockedContent = JSON.parse(decrypted.slice(unlockPrefix.length));
		}
		catch(e) {}
	}
}

window.customElements.define("project-page", ProjectPage);
