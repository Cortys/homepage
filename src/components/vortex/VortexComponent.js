import { LitElement, html, css } from "lit-element";
import {
	Vector2, Vector3,
	MeshStandardMaterial,
	Scene,
	RingGeometry,
	Mesh,
	LineSegments,
	AmbientLight,
	PointLight,
	SpotLight,
	WebGLRenderer,
	PerspectiveCamera,
	Clock
} from "three";
// import OrbitControls from "three-orbitcontrols";

const objectRadius = 4.5;
const radiusSegments = 120;// 160;
const cameraZ = 2;
const cameraY = -0.8;
const cameraDepth = Math.sqrt(cameraY ** 2 + cameraZ ** 2);
const cameraTan = Math.abs(cameraY / cameraZ);
const cameraAngle = Math.atan(cameraTan);
const cameraSquish = Math.cos(cameraAngle);
const noiseIntensity = 0.08;
const rippleIntensity = 0.03;
const dentNormalize = 5000;
const newRippleMinDistance = 10;
const newRippleMinDistanceSquared = newRippleMinDistance ** 2;
const newRippleMinDelay = 0.02;
const newRippleMaxDelay = 0.5;
const waveIntensity = 0.05;
const maxDepth = cameraDepth + noiseIntensity + 2 * rippleIntensity + waveIntensity;
const noCursorPosition = new Vector2(-1, -1);
const isTouch = "ontouchstart" in window || navigator.msMaxTouchPoints > 0;
const moveEvent = isTouch ? "touchmove" : "mousemove";
const maxRipples = isTouch ? 32 : 128;
const burstFrequencies = [0, 2, 4, 5, 7, 13];
const burstCount = burstFrequencies.length;
const maxBurstFrequency = Math.max(...burstFrequencies);
const glowUpProgress = 0.55;
const innerGlowUpDelay = 0.55;

function computeCameraSettings({ width, height }) {
	const aspect = width / height;
	const projHeight = objectRadius * cameraSquish * Math.cos(Math.atan(aspect));
	const fov = 360 * Math.atan(projHeight / (maxDepth + cameraTan * projHeight)) / Math.PI;
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
	constructor(time = 0, position = new Vector2(0, 0), intensity = 0) {
		this.time = time;
		this.position = position;
		this.intensity = intensity;
	}
}

class Burst {
	constructor(
		frequency = 0,
		pulsingFrequency = 0.1 + frequency / 3,
		phaseOffset = frequency * Math.PI,
		phaseFrequency = frequency / 128,
		phaseAmplitude = Math.log(frequency + 1) * Math.PI / 3
	) {
		this.frequency = frequency;
		this.pulsingFrequency = pulsingFrequency;
		this.phaseOffset = phaseOffset;
		this.phaseFrequency = phaseFrequency;
		this.phaseAmplitude = phaseAmplitude;
		this.intensity = 0;
		this.innerRadius = 0;
		this.outerRadius = 0;
	}

	setProgress(progress) {
		const relFreq = this.frequency / maxBurstFrequency;
		const innerProgress = Math.max(0, (1 - relFreq) * progress - innerGlowUpDelay) / (1 - innerGlowUpDelay);
		const progressPow = progress ** (1.1 + relFreq);

		this.innerRadius = objectRadius * innerProgress;
		this.outerRadius = objectRadius * 1.2 * progressPow;
		this.intensity = progressPow;
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
		},
		bursts: {
			value: burstFrequencies.map(f => new Burst(f))
		}
	};
}

function rippleVertexShader(shader, params, { maxRipples }) {
	const { vertexShader, fragmentShader } = shader;

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

		varying vec3 varPosition;

		${vertexShader.replace("#include <begin_vertex>", `
			vec3 transformed = vec3(position);
			varPosition = transformed;

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

	const newFragmentShader = `
		#define BURST_COUNT ${burstCount}

		const vec4 WHITE = vec4(1, 1, 1, 1);

		uniform float time;

		struct burst {
			float frequency;
			float pulsingFrequency;
			float phaseOffset;
			float phaseFrequency;
			float phaseAmplitude;
			float intensity;
			float innerRadius;
			float outerRadius;
		};
		uniform burst bursts[BURST_COUNT];

		varying vec3 varPosition;

		void addBurst(inout float remains, in burst b, in vec3 pp) {
			float frequency = b.frequency;
			float pulsingFrequency = b.pulsingFrequency;
			float phaseOffset = b.phaseOffset;
			float phaseFrequency = b.phaseFrequency;
			float phaseAmplitude = b.phaseAmplitude;
			float maxIntensity = b.intensity;
			float innerRadius = b.innerRadius;
			float outerRadius = b.outerRadius;

			if(outerRadius == 0.0)
				return;

			float phase = phaseOffset + phaseAmplitude * sin(phaseFrequency * time);
			float outsideOfCore = min(max(0.0, pp.y - innerRadius), outerRadius) / outerRadius;

			float i = max(0.0, cos(frequency * pp.x + phase));

			float d = (1.0 - outsideOfCore) + 3.0 * pp.z;

			float sinPulse = sin(pulsingFrequency * time);
			float pulse = mix(1.0, sinPulse * sinPulse, outsideOfCore);

			float burstIntensity = maxIntensity * pulse * min(1.0, i * i * d * d);

			remains *= 1.0 - burstIntensity;
		}

		${fragmentShader.replace("#include <dithering_fragment>", `
			#include <dithering_fragment>

			vec3 polarPosition = vec3(atan(varPosition.x, varPosition.y), length(varPosition.xy), varPosition.z);

			float remains = 1.0;

			for(int i = 0; i < BURST_COUNT; i++)
				addBurst(remains, bursts[i], polarPosition);

			gl_FragColor = mix(WHITE, gl_FragColor, remains);
		`)}
	`;

	Object.assign(shader.uniforms, params);
	shader.vertexShader = newVertexShader;
	shader.fragmentShader = newFragmentShader;
}

function createRippleMaterial(config, params, consts) {
	return new MeshStandardMaterial({
		roughness: 0.5,
		metalness: 0.5,
		...config,
		onBeforeCompile: shader => rippleVertexShader(shader, params, consts)
	});
}

function createScene() {
	const scene = new Scene();

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

	const geometry = new RingGeometry(Number.MIN_VALUE, objectRadius, 64, radiusSegments);
	const axis = new Vector3(0, 0, 1);
	const noise = createNoise(geometry);

	geometry.vertices.forEach((v, i) => {
		v.applyAxisAngle(axis, -Math.exp(v.length() ** -0.5));
		v.z = noise[i];
	});
	geometry.verticesNeedUpdate = true;

	const mesh = new Mesh(geometry, material);
	const wireframe = new LineSegments(geometry, wireMaterial);

	mesh.add(wireframe);

	// Lights:

	const ambient = new AmbientLight(0x2c37c4, 0.1);
	const point = new PointLight(0x2c37c4, 0.5);
	const spot = new SpotLight(0xc42c2d, 1.5);

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
	constructor() {
		super();

		this.burstMode = undefined;
		this.burstProgress = 0;
		this.delayGlowChangeBy = 0;

		const renderer = new WebGLRenderer({
			antialias: true,
			alpha: true
		});

		if(renderer.capabilities.maxVertexUniforms >= 250)
			this.renderer = renderer;
	}

	connectedCallback() {
		super.connectedCallback();

		this.init();
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		if(this._animationId)
			cancelAnimationFrame(this._animationId);

		if(this.resizeListener) {
			window.removeEventListener("resize", this.resizeListener);
			this.resizeListener = undefined;
		}

		if(this.enterListener) {
			window.removeEventListener(moveEvent, this.enterListener);
			this.enterListener = undefined;
		}

		if(this.moveListener) {
			window.removeEventListener(moveEvent, this.moveListener);
			this.moveListener = undefined;
		}
	}

	init() {
		if(!this.renderer)
			return;

		let cursorPosition = null;

		const { scene, mesh, params } = createScene();
		let currentRippleIdx = 0;
		const ripples = params.ripples.value;
		const bursts = params.bursts.value;
		let size = getSize();
		const camera = new PerspectiveCamera(...computeCameraSettings(size), 0.1, 6);

		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(size.width, size.height);
		params.size.value = [size.width, size.height];

		this.bursts = bursts;

		let initResolve;

		this.initialized = new Promise(resolve => initResolve = resolve);

		camera.position.z = cameraZ;
		camera.position.y = cameraY;
		camera.lookAt(0, 0, 0);

		// new OrbitControls(camera, this.renderer.domElement); // eslint-disable-line no-new

		const clock = new Clock();

		const animate = first => {
			this._animationId = requestAnimationFrame(animate);

			if(!this.burstMode)
				return;

			const Δt = clock.getDelta();
			const time = clock.elapsedTime;
			const rotateSpeed = 1 + 3 * this.burstProgress ** 2;

			mesh.rotateZ(-Δt * Math.PI / 20 * rotateSpeed);

			params.time.value = time;

			let newBurstProgress = this.burstProgress;

			if(this.delayGlowChangeBy > 0)
				this.delayGlowChangeBy -= Δt;
			else if(this.burstMode === "glowDown") {
				if(this.burstProgress > 0)
					newBurstProgress = Math.max(0, this.burstProgress - Δt);
			}
			else if(this.burstMode === "glowUp") {
				const toGo = glowUpProgress - this.burstProgress;

				if(toGo > 0)
					newBurstProgress = Math.min(glowUpProgress, this.burstProgress + 0.5 * Δt * toGo / glowUpProgress);
				else if(toGo < 0)
					newBurstProgress = Math.max(glowUpProgress, this.burstProgress - Δt);
			}
			else if(this.burstMode === "explode") {
				if(this.burstProgress < 1) {
					newBurstProgress = Math.min(1, this.burstProgress + 2.6 * Δt);

					if(newBurstProgress === 1)
						this.dispatchEvent(new CustomEvent("explosion-complete"));
				}
			}

			if(newBurstProgress !== this.burstProgress || first) {
				this.burstProgress = newBurstProgress;

				for(const burst of bursts)
					burst.setProgress(newBurstProgress);
			}

			if(newBurstProgress !== undefined || this.burstProgress !== 1 || first)
				this.renderer.render(scene, camera);

			if(first)
				initResolve();
		};

		requestAnimationFrame(() => animate(true));

		const resizeListener = () => {
			size = getSize();

			Object.assign(camera, computeCameraSettings(size));
			camera.updateProjectionMatrix();
			this.renderer.setSize(size.width, size.height);
			params.size.value = [size.width, size.height];

			cursorPosition = null;
			params.cursorPosition.value = noCursorPosition;
		};

		const addRipple = (time, position, intensity) => {
			ripples[currentRippleIdx] = new Ripple(time, position, intensity);

			if(++currentRippleIdx >= ripples.length)
				currentRippleIdx = 0;
		};

		const moveListener = e => {
			const p = isTouch ? e.touches[0] : e;

			cursorPosition = new Vector2(p.clientX, p.clientY);
			params.cursorPosition.value = cursorPosition;

			const time = clock.elapsedTime;
			const prevRippleIdx = currentRippleIdx === 0
				? ripples.length - 1
				: currentRippleIdx - 1;
			const prevRipple = ripples[prevRippleIdx];

			const [Δd, Δt] = ripples.length > 0
				? [cursorPosition.distanceToSquared(prevRipple.position), time - prevRipple.time]
				: [Infinity, Infinity];

			if(Δd >= newRippleMinDistanceSquared && Δt >= newRippleMinDelay)
				addRipple(time, cursorPosition, Δt > newRippleMaxDelay ? 0 : Math.pow(Δd, 1 / 3) / 500);
		};

		const enterListener = e => {
			cursorPosition = new Vector2(e.clientX, e.clientY);
			addRipple(clock.elapsedTime, cursorPosition, 0);
		};

		window.addEventListener("resize", resizeListener, false);
		window.addEventListener("mouseover", enterListener, {
			passive: true,
			capture: true
		});
		window.addEventListener(moveEvent, moveListener, {
			passive: true,
			capture: true
		});

		this.resizeListener = resizeListener;
		this.enterListener = enterListener;
		this.moveListener = moveListener;
	}

	static get styles() {
		return css`
			:host {
				display: block;
				overflow: hidden;
			}

			#graph, #graph canvas {
				position: absolute;
				width: 100%;
				height: 100%;
				top: 0;
				left: 0;
				background-color: var(--white);
			}
		`;
	}

	render() {
		return html`
			<div id="graph">${this.renderer.domElement}</div>
		`;
	}

	setBurstProgress(progress) {
		if(!this.bursts)
			return;

		this.burstProgress = progress;

		for(const burst of this.bursts)
			burst.setProgress(progress);
	}

	glowDown(immediate) {
		const prevBurstMode = this.burstMode;

		if(immediate || !prevBurstMode)
			this.setBurstProgress(0);
		else if(prevBurstMode === "explode")
			this.delayGlowChangeBy = 0.3;
		else if(prevBurstMode === "glowUp")
			this.delayGlowChangeBy = 0.15;
		else
			this.delayGlowChangeBy = 0;

		this.burstMode = "glowDown";

		return prevBurstMode !== "glowDown";
	}

	glowUp(immediate) {
		const prevBurstMode = this.burstMode;

		if(immediate || !prevBurstMode)
			this.setBurstProgress(glowUpProgress);
		else if(prevBurstMode === "glowDown" && this.burstProgress === 0)
			this.delayGlowChangeBy = 0.4;
		else
			this.delayGlowChangeBy = 0;

		this.burstMode = "glowUp";

		return prevBurstMode !== "glowUp";
	}

	explode(immediate) {
		if(immediate || !this.burstMode)
			this.setBurstProgress(1);

		const prevBurstMode = this.burstMode;

		this.burstMode = "explode";
		this.delayGlowChangeBy = 0;

		return prevBurstMode !== "explode";
	}

	centerShock() {
		console.log("test");
	}
}

window.customElements.define("vortex-component", VortexComponent);
