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
				cursor: pointer;
				transition: 0.2s all;
			}

			#card:hover {
				box-shadow: var(--strong-black-box-shadow);
				transform: translateY(-2px);
			}

			#bannerImg {
				position: relative;
				display: block;
				width: 100%;
				padding-top: 60%;
				overflow: hidden;
			}
			#bannerImg::slotted(*) {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				display: block;
				object-fit: cover;
			}

			#name {
				position: relative;
				display: flex;
				align-items: center;
				margin: 8px;
			}

			#name > * {
				flex: 1 0;
			}

			#name > h4 {
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
				<div id="name"><h4 title=${this.name}>${this.name}</h4><span class="year">${this.year}</span></div>
			</div>
		`;
	}
}

window.customElements.define("project-component", ProjectComponent);
