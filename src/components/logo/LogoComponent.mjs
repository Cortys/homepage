import { LitElement, html } from "@polymer/lit-element";
import Snap from "snapsvg";

import logoURL from "./logo.svg";

const mina = window.mina;

export default class LogoComponent extends LitElement {
	_render() {
		return html`
			<style>
				:host {
					display: block;
				}

				#logo {
					width: 500px;
					height: 500px;
				}
			</style>
			<svg id="logo"></svg>
		`;
	}

	_didRender() {
		const container = new Snap(this.shadowRoot.querySelector("#logo"));

		Snap.load(logoURL, ctx => {
			const logo = ctx.select("#svg");
			const g = container.g();
			const full = logo.select("#full");
			const half = full.clone();
			const door = full.clone();

			function a() {
				let done = false;
				const call = function() {
					this.transform(this.data("before"));
					if(done)
						a();
					else
						done = true;
				};

				full.data("before", full.attr("transform"));
				half.data("before", half.attr("transform"));
				full.animate({ transform: `${full.attr("transform")}r360,250,250` }, 5000, call);
				half.animate({ transform: `${half.attr("transform")}r-360,250,250` }, 5000, call);
			}

			function b(t) {
				logo.animate({ transform: `t-137,-135S${t ? 1 : 1.25}` }, 20000, mina.elastic, () => {
					b(!t);
				});
			}

			logo.prepend(half);
			logo.append(door);
			g.append(logo);

			logo.attr({ cursor: "pointer" });
			half.attr({ opacity: 0.5 });

			full.transform("t135,135");
			half.transform("t135,135r270,250,250s1.034,1.034,250,250");

			a();
			b();

			door.transform("T135,135S0");
			door.attr({ fill: "#151515" });

			const enter = g.circle(250, 250, 50);

			enter.attr({ fill: "#ffffff", opacity: 0, cursor: "pointer" });

			function show() {
				door.animate({ transform: "T135,135S1.2" }, 100, mina.linear);
				enter.animate({ opacity: 1 }, 100);
			}

			const stopped = false;

			function hide() {
				if(stopped)
					return;
				door.animate({ transform: "T135,135S0" }, 100, mina.linear);
				enter.animate({ opacity: 0 }, 100);
			}

			g.mouseover(show);
			g.touchstart(show);
			g.mouseout(hide);
			g.touchend(hide);
			g.touchcancel(hide);

			container.append(g);
		});
	}
}

window.customElements.define("logo-component", LogoComponent);
