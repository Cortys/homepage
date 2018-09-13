import { LitElement, html } from "@polymer/lit-element";
import * as THREE from "three";
// import OrbitControls from "three-orbitcontrols";

class GraphComponent extends LitElement {
	constructor() {
		super();

		const aspect = window.innerWidth / window.innerHeight;
		const fov = 360 * Math.atan(3 * Math.cos(Math.atan(aspect)) / 2.05) / Math.PI;
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 6);
		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});

		console.log(aspect, fov);

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);

		// const controls = new OrbitControls(camera, renderer.domElement);

		const geometry = new THREE.RingGeometry(-1, 3, 64, 80);
		const material = new THREE.MeshStandardMaterial({ color: 0x151515, flatShading: true });
		const mesh = new THREE.Mesh(geometry, material);

		const wireMaterial = new THREE.MeshStandardMaterial({ color: 0x202020, wireframe: true });
		const wireframe = new THREE.LineSegments(geometry, wireMaterial);

		mesh.add(wireframe);

		const ambient = new THREE.AmbientLight(0xffffff, 1);
		const point = new THREE.PointLight(0xc42c2d, 0.3);

		point.position.z = 10;

		scene.add(ambient);
		scene.add(point);
		scene.add(mesh);
		camera.position.z = 2;

		const clock = new THREE.Clock();
		const axis = new THREE.Vector3(0, 0, 1);

		geometry.vertices.forEach(v => v.applyAxisAngle(axis, (1 + v.length()) ** 2));

		const randomOffsets = geometry.vertices.map(v => (1 + v.length()) * Math.random() * 0.005);

		this.renderer = renderer;

		requestAnimationFrame(function animate() {
			requestAnimationFrame(animate);

			const delta = clock.getDelta();

			geometry.vertices.forEach((v, i) => v.z = randomOffsets[i]
				+ Math.sin(v.length() * 6 - clock.getElapsedTime() * Math.PI / 5) * 0.05);
			geometry.verticesNeedUpdate = true;

			mesh.rotateZ(-delta * Math.PI / 10);

			renderer.render(scene, camera);
		});

		window.addEventListener("resize", () => {
			const aspect = window.innerWidth / window.innerHeight;
			const fov = 360 * Math.atan(3 * Math.cos(Math.atan(aspect)) / 2.05) / Math.PI;

			camera.aspect = aspect;
			camera.fov = fov;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		}, false);
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
