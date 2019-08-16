import { LitElement, html, css } from "lit-element";

class MenuComponent extends LitElement {
	constructor() {
		super();

		this.addEventListener("mouseover", e => this.onMouseEvent(e), { passive: true });
		this.addEventListener("mouseout", e => this.onMouseEvent(e), { passive: true });
		this.addEventListener("mousemove", e => this.onMouseEvent(e), { passive: true });

		this.hovered = false;
		this.hoverStartEventDelay = 0;
		this.hoverEndEventDelay = 0;
	}

	static get properties() {
		return {
			hovered: { type: Boolean },
			hoverStartEventDelay: { type: Number },
			hoverEndEventDelay: { type: Number }
		};
	}

	static get styles() {
		return css`
			a {
				position: relative;
				display: inline-block;
				color: inherit;
				text-decoration: none;
				margin: 0 8px;
				transition: 0.1s all ease-in-out;
			}

			a:hover {
				color: var(--white);
				text-shadow: 0px -2px 8px var(--off-white);
			}
		`;
	}

	render() {
		return html`
			<a href="javascript:alert('Coming soon(ish)™.')">About</a>
			&middot;
			<a href="javascript:alert('Coming soon(ish)™.')">Projects</a>
			&middot;
			<a href="https://github.com/Cortys">GitHub</a>
		`;
	}

	onMouseEvent() {
		const hovered = this.shadowRoot.querySelector("a:hover") != null;
		const oldHovered = this.hovered;

		if(hovered === oldHovered)
			return;

		this.hovered = hovered;

		const emit = () => {
			this.dispatchEvent(new CustomEvent("hovered-change", {
				detail: hovered,
				composed: true
			}));
		};
		const delay = hovered
			? this.hoverStartEventDelay
			: this.hoverEndEventDelay;

		if(delay > 0)
			setTimeout(() => {
				const preEmitHovered = this.shadowRoot.querySelector("a:hover") != null;

				if(preEmitHovered !== hovered)
					return;

				emit();
			}, delay);
		else
			emit();
	}
}

window.customElements.define("menu-component", MenuComponent);
