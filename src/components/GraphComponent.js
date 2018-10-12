import { LitElement, html } from "@polymer/lit-element";
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";

const enableControls = true;
const objectRadius = 3;
const cameraDepth = 2;
const noiseIntensity = 0.04;
const rippleIntensity = 0.1;
const waveIntensity = 0.05;
const maxDepth = cameraDepth + noiseIntensity + rippleIntensity + waveIntensity;

function computeCameraSettings({ width, height }) {
	const aspect = width / height;
	const fov = 360 * Math.atan(objectRadius * Math.cos(Math.atan(aspect)) / maxDepth) / Math.PI;
	const a = [fov, aspect];

	return {
		fov, aspect,
		[Symbol.iterator]: () => a[Symbol.iterator]()
	};
}

function createScene() {
	const scene = new THREE.Scene();

	// Materials:

	const material = new THREE.MeshStandardMaterial({ color: 0x151515, flatShading: true });
	const wireMaterial = new THREE.MeshStandardMaterial({ color: 0x202020, wireframe: true });

	// Geometry:

	const geometry = new THREE.RingGeometry(-1, objectRadius, 64, 80);
	const wireframe = new THREE.LineSegments(geometry, wireMaterial);

	const mesh = new THREE.Mesh(geometry, material);
	const axis = new THREE.Vector3(0, 0, 1);

	geometry.vertices.forEach(v => v.applyAxisAngle(axis, -Math.exp(v.length() ** -0.5)));

	mesh.add(wireframe);

	// Lights:

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

	return { scene, geometry, mesh };
}

function createNoise(geometry) {
	const normalizedIntensity = noiseIntensity / (1 + objectRadius);

	return geometry.vertices.map(v => (1 + v.length()) * Math.random() * normalizedIntensity);
}

function getSize() {
	return {
		width: window.innerWidth,
		height: window.innerHeight
	};
}

class GraphComponent extends LitElement {
	constructor() {
		super();

		// const ripples = [];
		let cursorPosition = null;
		let size = getSize();

		const { scene, geometry, mesh } = createScene();

		const camera = new THREE.PerspectiveCamera(...computeCameraSettings(size), 0.1, 6);
		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(size.width, size.height);

		if(enableControls)
			new OrbitControls(camera, renderer.domElement); // eslint-disable-line no-new

		camera.position.z = 2;

		const zAxis = new THREE.Vector3(0, 0, 1);
		const clock = new THREE.Clock();

		const noise = createNoise(geometry);

		this.renderer = renderer;

		requestAnimationFrame(function animate() {
			requestAnimationFrame(animate);

			const delta = clock.getDelta();
			const time = clock.getElapsedTime();

			mesh.rotateZ(-delta * Math.PI / 20);

			geometry.vertices.forEach((v, i) => {
				const projected = v.clone().applyAxisAngle(zAxis, mesh.rotation.z).project(camera);
				const canvasPosition = new THREE.Vector2(projected.x, projected.y);

				canvasPosition.x = (canvasPosition.x + 1) * size.width / 2;
				canvasPosition.y = -(canvasPosition.y - 1) * size.height / 2;

				const distance = cursorPosition ? cursorPosition.distanceToSquared(canvasPosition) : Infinity;

				v.z = noise[i]
					+ -rippleIntensity * Math.exp(-distance / 5000)
					+ waveIntensity * Math.max(v.lengthSq(), 1) ** -1
					* Math.sin(v.length() * 6 - time * Math.PI / 5);
			});
			geometry.verticesNeedUpdate = true;

			renderer.render(scene, camera);
		});

		window.addEventListener("resize", () => {
			size = getSize();

			Object.assign(camera, computeCameraSettings(size));
			camera.updateProjectionMatrix();
			renderer.setSize(size.width, size.height);

			cursorPosition = null;
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