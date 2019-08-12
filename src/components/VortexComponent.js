import { LitElement, html } from "lit-element";
import * as THREE from "three";
// import OrbitControls from "three-orbitcontrols";

const objectRadius = 6;
const radiusSegments = 160;
const cameraDepth = 2;
const noiseIntensity = 0.08;
const rippleIntensity = 0.03;
const dentNormalize = 5000;
const newRippleMinDistance = 10;
const newRippleMinDistanceSquared = newRippleMinDistance ** 2;
const newRippleMinDelay = 0.02;
const waveIntensity = 0.05;
const maxDepth = cameraDepth + noiseIntensity + 2 * rippleIntensity + waveIntensity;
const noCursorPosition = new THREE.Vector2(-1, -1);
const isTouch = "ontouchstart" in window || navigator.msMaxTouchPoints > 0;
const moveEvent = isTouch ? "touchmove" : "mousemove";
const maxRipples = isTouch ? 32 : 128;

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

class Ripple {
	constructor(time = 0, position = new THREE.Vector2(0, 0), intensity = 0) {
		this.time = time;
		this.position = position;
		this.intensity = intensity;
	}
}

function createRippleParams({ maxRipples }) {
	return {
		size: {
			value: [0, 0]
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
		ripples: {
			value: Array(maxRipples).fill(new Ripple())
		}
	};
}

function rippleVertexShader(shader, params, { maxRipples }) {
	const { vertexShader } = shader;

	const newVertexShader = `
		#define M_PI 3.1415926535897932384626433832795
		#define MAX_RIPPLES ${maxRipples}

		uniform vec2 size;
		uniform float time;
		uniform float rippleIntensity;
		uniform float waveIntensity;
		uniform float dentNormalize;
		uniform vec2 cursorPosition;

		struct ripple {
			float time;
			vec2 position;
			float intensity;
		};

		uniform ripple ripples[MAX_RIPPLES];

		${vertexShader.replace("#include <begin_vertex>", `
			vec3 transformed = vec3(position);

			vec4 projected4 = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			vec2 projected = vec2(projected4.x, -projected4.y);
			projected = (projected / projected4.w + 1.0) * size / 2.0;

			float lenSq = dot(transformed, transformed);
			float len = sqrt(lenSq);

			float mainWave = waveIntensity
				/ max(lenSq, 1.0)
				* sin(len * 6.0 - time * M_PI / 5.0);

			float dent;

			if(cursorPosition.x != -1.0) {
				vec2 delta = cursorPosition - projected;
				float cursorDistSq = dot(delta, delta);
				dent = rippleIntensity * exp(-cursorDistSq / dentNormalize);
			}
			else dent = 0.0;

			float ripplesAgg = 0.0;

			for(int i = 0; i < MAX_RIPPLES; i++) {
				ripple r = ripples[i];
				vec2 d = r.position - projected;
				float distSq = dot(d, d);
				float dist = sqrt(distSq);
				float t = time - r.time;
				float sinVal = dist / 50.0 - t * 20.0;
				float attack = min(t, 0.1) * 10.0;

				ripplesAgg += r.intensity * attack * exp(-distSq / 50000.0 - 2.0 * t) * sin(sinVal);
			}

			transformed.z += mainWave - dent - ripplesAgg;
		`)}
	`;

	Object.assign(shader.uniforms, params);
	shader.vertexShader = newVertexShader;
}

function createRippleMaterial(config, params, consts) {
	return new THREE.MeshStandardMaterial({
		...config,
		onBeforeCompile: shader => rippleVertexShader(shader, params, consts)
	});
}

function createScene(renderer) {
	const scene = new THREE.Scene();

	if(renderer.capabilities.maxVertexUniforms < 250)
		return;

	// Materials:
	const consts = {
		maxRipples
	};
	const params = createRippleParams(consts);
	const material = createRippleMaterial({
		color: 0x151515,
		flatShading: true
	}, params, consts);
	const wireMaterial = createRippleMaterial({
		color: 0x202020,
		wireframe: true
	}, params, consts);

	// Geometry:

	const geometry = new THREE.RingGeometry(Number.MIN_VALUE, objectRadius, 64, radiusSegments);
	const axis = new THREE.Vector3(0, 0, 1);
	const noise = createNoise(geometry);

	geometry.vertices.forEach((v, i) => {
		v.applyAxisAngle(axis, -Math.exp(v.length() ** -0.5));
		v.z = noise[i];
	});
	geometry.verticesNeedUpdate = true;

	const mesh = new THREE.Mesh(geometry, material);
	const wireframe = new THREE.LineSegments(geometry, wireMaterial);

	mesh.add(wireframe);

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

class VortexComponent extends LitElement {
	connectedCallback() {
		super.connectedCallback();

		this.init();
	}

	init() {
		let cursorPosition = null;

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});

		const { scene, mesh, params } = createScene(renderer) || {};

		let currentRippleIdx = 0;
		const ripples = params.ripples.value;
		let size = getSize();
		const camera = new THREE.PerspectiveCamera(...computeCameraSettings(size), 0.1, 6);

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(size.width, size.height);
		params.size.value = [size.width, size.height];

		// new OrbitControls(camera, renderer.domElement); // eslint-disable-line no-new

		camera.position.z = 2;
		camera.position.y = -0.8;
		camera.lookAt(0, 0, 0);

		const clock = new THREE.Clock();

		this.renderer = renderer;

		const animate = () => {
			if(this.isConnected)
				requestAnimationFrame(animate);

			const Δt = clock.getDelta();
			const time = clock.elapsedTime;

			mesh.rotateZ(-Δt * Math.PI / 20);

			params.time.value = time;

			renderer.render(scene, camera);
		};

		requestAnimationFrame(animate);

		const resizeListener = () => {
			size = getSize();

			Object.assign(camera, computeCameraSettings(size));
			camera.updateProjectionMatrix();
			renderer.setSize(size.width, size.height);
			params.size.value = [size.width, size.height];

			cursorPosition = null;
			params.cursorPosition.value = noCursorPosition;
		};

		const moveListener = e => {
			const p = isTouch ? e.touches[0] : e;

			cursorPosition = new THREE.Vector2(p.clientX, p.clientY);
			params.cursorPosition.value = cursorPosition;

			const time = clock.elapsedTime;
			const prevRippleIdx = currentRippleIdx === 0
				? ripples.length - 1
				: currentRippleIdx - 1;
			const prevRipple = ripples[prevRippleIdx];

			const [Δd, Δt] = ripples.length > 0
				? [cursorPosition.distanceToSquared(prevRipple.position), time - prevRipple.time]
				: [Infinity, Infinity];

			if(Δd >= newRippleMinDistanceSquared && Δt >= newRippleMinDelay) {
				ripples[currentRippleIdx] = new Ripple(time, cursorPosition, Math.pow(Δd, 1 / 3) / 500);

				if(++currentRippleIdx >= ripples.length)
					currentRippleIdx = 0;
			}
		};

		window.addEventListener("resize", resizeListener, false);

		window.addEventListener(moveEvent, moveListener, {
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

window.customElements.define("vortex-component", VortexComponent);
