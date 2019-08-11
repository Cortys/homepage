import { LitElement, html } from "lit-element";
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";

const objectRadius = 6;
const radiusSegments = 160;
const cameraDepth = 2;
const noiseIntensity = 0.08;
const rippleIntensity = 0.03;
const dentNormalize = 5000;
const newRippleMinDistance = 20;
const newRippleMinDistanceSquared = newRippleMinDistance ** 2;
const newRippleMinDelay = 0.05;
const removeRippleThreshold = 0.005;
const logRemoveRippleThreshold = Math.log(removeRippleThreshold);
const waveIntensity = 0.05;
const maxDepth = cameraDepth + noiseIntensity + 2 * rippleIntensity + waveIntensity;
const noCursorPosition = new THREE.Vector2(-1, -1);

function computeCameraSettings({ width, height }) {
	const aspect = width / height;
	const fov = 360 * Math.atan(objectRadius * 0.5 * Math.cos(Math.atan(aspect)) / maxDepth) / Math.PI;
	const a = [fov, aspect];

	return {
		fov, aspect,
		[Symbol.iterator]: () => a[Symbol.iterator]()
	};
}

function createNoise(geometry) {
	const normalizedIntensity = noiseIntensity / (1 + objectRadius);

	return geometry.vertices.map(
		v => (1 + v.length()) * Math.random() * normalizedIntensity
	);
}

function createRippleParams() {
	return {
		width: {
			value: 0
		},
		height: {
			value: 0
		},
		time: {
			value: 0
		},
		rippleIntensity: {
			value: rippleIntensity
		},
		waveIntensity: {
			value: waveIntensity
		},
		dentNormalize: {
			value: dentNormalize
		},
		cursorPosition: {
			value: noCursorPosition
		},
	};
}

function rippleVertexShader(shader, params) {
	const { vertexShader } = shader;

	const newVertexShader = `
		#define M_PI 3.1415926535897932384626433832795

		uniform float width;
		uniform float height;
		uniform float time;
		uniform float rippleIntensity;
		uniform float waveIntensity;
		uniform float dentNormalize;
		uniform vec2 cursorPosition;

		${vertexShader.replace("#include <begin_vertex>", `
			vec3 transformed = vec3(position);

			vec4 projected = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			projected.x = (projected.x / projected.w + 1.0) * width * 0.5;
			projected.y = (-projected.y / projected.w + 1.0) * height * 0.5;

			float lenSq = dot(transformed, transformed);
			float len = sqrt(lenSq);

			float mainWave = waveIntensity
				/ max(lenSq, 1.0)
				* sin(len * 6.0 - time * M_PI / 5.0);

			float dent;

			if(cursorPosition.x != -1.0) {
				float deltaX = cursorPosition.x - projected.x;
				float deltaY = cursorPosition.y - projected.y;
				float cursorDistSq = deltaX * deltaX + deltaY * deltaY;
				dent = rippleIntensity * exp(-cursorDistSq / dentNormalize);
			}
			else dent = 0.0;

			transformed.z += mainWave - dent;
		`)}
	`;


	Object.assign(shader.uniforms, params);
	shader.vertexShader = newVertexShader;
	console.log(newVertexShader);
}

function createRippleMaterial(config, params) {
	return new THREE.MeshStandardMaterial({
		...config,
		onBeforeCompile: shader => rippleVertexShader(shader, params)
	});
}

function createScene() {
	const scene = new THREE.Scene();

	// Materials:
	const params = createRippleParams();
	const material = createRippleMaterial({
		color: 0x151515,
		flatShading: true
	}, params);
	const wireMaterial = createRippleMaterial({
		color: 0x202020,
		wireframe: true
	}, params);

	// Geometry:

	const geometry = new THREE.RingGeometry(-1, objectRadius, 64, radiusSegments);

	const mesh = new THREE.Mesh(geometry, material);
	const wireframe = new THREE.LineSegments(geometry, wireMaterial);

	mesh.add(wireframe);

	const axis = new THREE.Vector3(0, 0, 1);
	const noise = createNoise(geometry);

	geometry.vertices.forEach((v, i) => {
		v.applyAxisAngle(axis, -Math.exp(v.length() ** -0.5));
		v.z = noise[i];
	});
	geometry.verticesNeedUpdate = true;

	// Lights:

	const ambient = new THREE.AmbientLight(0x2c37c4, 0.1);
	const point = new THREE.PointLight(0x2c37c4, 0.5);
	const spot = new THREE.SpotLight(0xc42c2d, 1.5);

	point.position.z = 10;
	spot.position.z = 10;
	spot.angle = Math.PI / 15;
	spot.penumbra = 0.5;
	spot.decay = 2;

	scene.add(ambient);
	scene.add(point);
	scene.add(spot);
	scene.add(mesh);

	return { scene, mesh, params };
}

function getSize() {
	return {
		width: window.innerWidth,
		height: window.innerHeight
	};
}

class GraphComponent extends LitElement {
	connectedCallback() {
		super.connectedCallback();

		this.init();
	}

	init() {
		const ripples = [];
		let cursorPosition = null;

		const { scene, mesh, params } = createScene();

		let size = getSize();
		const camera = new THREE.PerspectiveCamera(...computeCameraSettings(size), 0.1, 6);
		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(size.width, size.height);
		params.width.value = size.width;
		params.height.value = size.height;

		new OrbitControls(camera, renderer.domElement); // eslint-disable-line no-new

		camera.position.z = 2;

		const clock = new THREE.Clock();

		this.renderer = renderer;

		const animate = () => {
			if(this.isConnected)
				requestAnimationFrame(animate);

			const Δt = clock.getDelta();
			const time = clock.elapsedTime;

			const cutoffIndex = ripples.findIndex(({ time: rippleTime }) => {
				return logRemoveRippleThreshold > -2 * (time - rippleTime);
			});

			if(cutoffIndex >= 0)
				ripples.splice(cutoffIndex);

			mesh.rotateZ(-Δt * Math.PI / 20);

			params.time.value = time;

			// geometry.vertices.forEach((v, i) => {
			// 	const projected = v.clone().applyAxisAngle(zAxis, mesh.rotation.z).project(camera);
			// 	const canvasPosition = new THREE.Vector2(projected.x, projected.y);
			//
			// 	canvasPosition.x = (canvasPosition.x + 1) * size.width / 2;
			// 	canvasPosition.y = -(canvasPosition.y - 1) * size.height / 2;
			//
			// 	const distance = cursorPosition ? cursorPosition.distanceToSquared(canvasPosition) : Infinity;
			//
			// 	const ripple = ripples.reduce((acc, { origin, time: rippleTime }) => {
			// 		const Δd2 = canvasPosition.distanceToSquared(origin);
			// 		const Δd = Math.sqrt(Δd2);
			// 		const Δt = time - rippleTime;
			// 		const sinVal = Δd / 50 - Δt * 20;
			//
			// 		if(sinVal >= 0)
			// 			return acc;
			//
			// 		return acc + Math.exp(-Δd2 / 50000 - 2 * Δt) * Math.sin(sinVal);
			// 	}, 0);
			//
			// 	v.z = noise[i]
			// 		+ -rippleIntensity * Math.exp(-distance / 5000)
			// 		+ -rippleIntensity * ripple
			// 		+ waveIntensity * Math.max(v.lengthSq(), 1) ** -1
			// 		* Math.sin(v.length() * 6 - time * Math.PI / 5);
			// });
			// geometry.verticesNeedUpdate = true;

			renderer.render(scene, camera);
		};

		requestAnimationFrame(animate);

		window.addEventListener("resize", () => {
			size = getSize();

			Object.assign(camera, computeCameraSettings(size));
			camera.updateProjectionMatrix();
			renderer.setSize(size.width, size.height);
			params.width.value = size.width;
			params.height.value = size.height;

			cursorPosition = null;
			params.cursorPosition.value = noCursorPosition;
		}, false);

		window.addEventListener("mousemove", e => {
			cursorPosition = new THREE.Vector2(e.clientX, e.clientY);
			params.cursorPosition.value = cursorPosition;

			const time = clock.elapsedTime;
			const [Δd, Δt] = ripples.length > 0
				? [cursorPosition.distanceToSquared(ripples[0].origin), time - ripples[0].time]
				: [Infinity, Infinity];

			if(Δd >= newRippleMinDistanceSquared && Δt >= newRippleMinDelay)
				ripples.unshift({
					origin: cursorPosition, time
				});
		}, {
			passive: true,
			capture: true
		});
	}

	render() {
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

	updated() {
		const graphElement = this.shadowRoot.querySelector("#graph");

		graphElement.appendChild(this.renderer.domElement);
	}
}

window.customElements.define("graph-component", GraphComponent);
