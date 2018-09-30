import { LitElement, html } from "@polymer/lit-element";
import * as THREE from "three";
// import OrbitControls from "three-orbitcontrols";

class GraphComponent extends LitElement {
	constructor() {
		super();

		let size = {
			width: window.innerWidth,
			height: window.innerHeight
		};
		let cursorPosition = null;

		const aspect = size.width / size.height;
		const fov = 360 * Math.atan(3 * Math.cos(Math.atan(aspect)) / 2.05) / Math.PI;
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 6);
		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		const zAxis = new THREE.Vector3(0, 0, 1);

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(size.width, size.height);

		// const controls = new OrbitControls(camera, renderer.domElement);
		//
		// console.log(controls);

		const geometry = new THREE.RingGeometry(-1, 3, 64, 80);
		const material = new THREE.MeshStandardMaterial({ color: 0x151515, flatShading: true });
		const mesh = new THREE.Mesh(geometry, material);

		const wireMaterial = new THREE.MeshStandardMaterial({ color: 0x202020, wireframe: true });
		const wireframe = new THREE.LineSegments(geometry, wireMaterial);

		mesh.add(wireframe);
		const ambient = new THREE.AmbientLight(0x2c37c4, 1);
		const point = new THREE.PointLight(0x2c37c4, 0.1);
		const spot = new THREE.SpotLight(0xc42c2d, 1);

		point.position.z = 10;
		spot.position.z = 10;
		spot.angle = Math.PI / 15;
		spot.penumbra = 0.5;
		spot.decay = 2;

		scene.add(ambient);
		scene.add(point);
		scene.add(spot);
		scene.add(mesh);
		camera.position.z = 2;

		const clock = new THREE.Clock();
		const axis = new THREE.Vector3(0, 0, 1);

		geometry.vertices.forEach(v => v.applyAxisAngle(axis, -Math.exp(v.length() ** -0.5)));

		const randomOffsets = geometry.vertices.map(v => (1 + v.length()) * Math.random() * 0.01);

		this.renderer = renderer;

		requestAnimationFrame(function animate() {
			requestAnimationFrame(animate);

			const delta = clock.getDelta();
			const time = clock.getElapsedTime();
			// const delta = 0;

			mesh.rotateZ(-delta * Math.PI / 20);

			geometry.vertices.forEach((v, i) => {
				const projected = v.clone().applyAxisAngle(zAxis, mesh.rotation.z).project(camera);
				const canvasPosition = new THREE.Vector2(projected.x, projected.y);

				canvasPosition.x = (canvasPosition.x + 1) * size.width / 2;
				canvasPosition.y = -(canvasPosition.y - 1) * size.height / 2;

				const distance = cursorPosition ? cursorPosition.distanceToSquared(canvasPosition) : 0;

				v.z = randomOffsets[i]
					+ (distance > 0 ? -0.1 * Math.exp(-distance / 5000) : 0)
					+ 0.05 * Math.max(v.lengthSq(), 1) ** -1
					* Math.sin(v.length() * 6 - time * Math.PI / 5);
			});
			geometry.verticesNeedUpdate = true;

			renderer.render(scene, camera);
		});

		window.addEventListener("resize", () => {
			size = {
				width: window.innerWidth,
				height: window.innerHeight
			};

			const aspect = size.width / size.height;
			const fov = 360 * Math.atan(3 * Math.cos(Math.atan(aspect)) / 2.05) / Math.PI;

			camera.aspect = aspect;
			camera.fov = fov;
			camera.updateProjectionMatrix();

			cursorPosition = null;

			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(size.width, size.height);
		}, false);

		window.addEventListener("mousemove", e => {
			cursorPosition = new THREE.Vector2(e.clientX, e.clientY);
		}, {
			passive: true,
			capture: true
		});
	}

	_render() {
		return html`
			<style>
				:host {
					display: block;
				}

				#graph, #graph canvas {
					position: absolute;
					width: 100%;
					height: 100%;
					top: 0;
					left: 0;

				}
			</style>
			<div id="graph"></div>
		`;
	}

	_didRender() {
		const graphElement = this.shadowRoot.querySelector("#graph");

		graphElement.appendChild(this.renderer.domElement);
	}
}

window.customElements.define("graph-component", GraphComponent);
