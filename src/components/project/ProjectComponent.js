import { LitElement, html, css } from "lit-element";

class ProjectComponent extends LitElement {
	static get properties() {
		return {
			name: String,
			year: Number,
			url: String,
			repo: String
		};
	}

	static get styles() {
		return css`
			#card {
				position: relative;
				border-radius: 4px;
				overflow: hidden;
				background-color: var(--white);
				box-shadow: var(--black-box-shadow);
			}

			#bannerImg {
				position: relative;
				display: block;
				width: 100%;
				padding-top: 60%;
				background-color: var(--off-black);
				overflow: hidden;
			}
			#bannerImg::slotted(*) {
				position: absolute;
				top: 0;
				display: block;
				width: 100%;
			}

			#name {
				position: relative;
				display: flex;
				align-items: center;
				margin: 12px;
			}

			#name > * {
				flex: 1 0;
			}

			#name > h3 {
				font-weight: 300;
				margin: 0;
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
			}

			#name > .year {
				flex: 0 0;
				background-color: var(--beige);
				color: var(--white);
				padding: 4px 8px;
				border-radius: 2px;
				margin-left: 2px;
			}
		`;
	}

	get mainImgUrl() {
		return this.querySelector("[slot=mainImg]").href;
	}

	render() {
		return html`
			<div id="card">
				<slot id="bannerImg" name="bannerImg"></slot>
				<div id="name"><h3 title=${this.name}>${this.name}</h3><span class="year">${this.year}</span></div>
			</div>
		`;
	}
}

window.customElements.define("project-component", ProjectComponent);
