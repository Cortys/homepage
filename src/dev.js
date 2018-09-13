// Reload page when a component is redefined in a dev environment:
if(process.env.NODE_ENV === "development") {
	const define = window.customElements.define;

	window.customElements.define = function(name, ...args) {
		if(window.customElements.get(name))
			window.location.reload();
		else
			return define.call(this, name, ...args);
	};
}
