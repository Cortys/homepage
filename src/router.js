import { Router } from "@vaadin/router";

export const menuEntries = [{
	name: "About",
	path: "about",
	component: "about-page",
	action: () => import("./pages/about/AboutPage")
}, {
	name: "Projects",
	path: "projects",
	component: "projects-page",
	action: () => import("./pages/projects/ProjectsPage")
}, {
	name: "Projects/?",
	hidden: true,
	path: "projects/:id",
	component: "project-page",
	action: () => import("./pages/projects/ProjectPage")
}];

const baseUrl = process.env.PUBLIC_PATH || "/";

export const router = new Router(undefined, {
	baseUrl
});

if(!window.location.pathname.startsWith(baseUrl))
	window.history.pushState({}, "", router.urlForPath(window.location.pathname));

let mainPage;

router.setRoutes([{
	name: "main",
	path: "",
	animate: true,
	action(_, commands) {
		if(mainPage == null)
			mainPage = commands.component("main-page");

		return mainPage;
	},
	children: [...menuEntries, {
		name: "not-found",
		path: "(.+)",
		component: "div"
	}, {
		name: "landing",
		path: "",
		component: "div"
	}]
}]);

export function goHome() {
	Router.go(router.urlForName("landing"));
}

export function goProjects() {
	Router.go(router.urlForName("Projects"));
}

export const routed = c => class extends c {
	connectedCallback() {
		super.connectedCallback();

		if(!this.routeChanged)
			return;

		window.addEventListener("vaadin-router-location-changed",
			this._routedCallback = ({ detail: { location } }) => this.routeChanged(location));

		this.routeChanged(router.location, true);
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		if(!this._routedCallback)
			return;

		window.removeEventListener("vaadin-router-location-changed", this._routedCallback);
	}
};

let lastClickedProject;

export function projectClicked(projectElement) {
	lastClickedProject = projectElement;
}

export function getLastClickedProject() {
	return lastClickedProject;
}

window.addEventListener("vaadin-router-location-changed", ({ detail: { location: { route } } }) => {
	if(route != null && route.name === "Projects/?") // Preserve history for direct inter-project navigation.
		return;

	lastClickedProject = undefined;
});
