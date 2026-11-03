<script lang="ts">
	import { T, useTask, useThrelte } from "@threlte/core";
	import { interactivity } from "@threlte/extras";
	import { onDestroy, onMount } from "svelte";
	import { Clock, Color, GLSL3, Vector2 } from "three";
	import fragmentShader from "./shaders/fragment.glsl?raw";
	import vertexShader from "./shaders/vertex.glsl?raw";

	interactivity();

	// ドットの色はテーマの CSS 変数 --color-hero-dots から読む（variables.css）
	const DEFAULT_DOT_COLOR = "#39bc47";
	function readDotColor(): string {
		const value = getComputedStyle(document.documentElement)
			.getPropertyValue("--color-hero-dots")
			.trim();
		return value || DEFAULT_DOT_COLOR;
	}

	// Uniforms
	const MAX_CLICKS = 10;
	const { size } = useThrelte();
	export const uniforms = {
		uResolution: {
			value: new Vector2(size.current.width, size.current.height),
		},
		uTime: { value: 0 },
		uColor: { value: new Color(DEFAULT_DOT_COLOR) },
		uClickPos: {
			value: Array.from({ length: MAX_CLICKS }, () => new Vector2(-1, -1)),
		},
		uClickTimes: { value: new Float32Array(MAX_CLICKS) },
		uShapeType: { value: 0 },
		uPixelSize: { value: 4 },
	};

	// Click ripple effect
	const { canvas } = useThrelte();
	let clickIndex = 0;
	export function onPointerDown(event: PointerEvent) {
		const rect = canvas?.getBoundingClientRect();
		if (!rect) return;
		const fx = (event.clientX - rect.left) * (canvas.width / rect.width);
		const fy =
			canvas.height -
			(event.clientY - rect.top) * (canvas.height / rect.height);

		uniforms.uClickPos.value[clickIndex].set(fx, fy);
		uniforms.uClickTimes.value[clickIndex] = uniforms.uTime.value;
		clickIndex = (clickIndex + 1) % MAX_CLICKS;
	}

	// Camera frustum
	const frustumSize = 50;
	const camRight = frustumSize / 2;
	const camLeft = -camRight;
	const camTop = frustumSize / 2;
	const camBottom = -camTop;

	// Main loop
	const clock = new Clock();
	useTask(() => {
		uniforms.uTime.value = clock.getElapsedTime();
	});

	// テーマ（<html data-theme> または OS の設定）が変わったら色を合わせる
	const syncDotColor = () => uniforms.uColor.value.set(readDotColor());
	let themeObserver: MutationObserver | undefined;
	let colorSchemeQuery: MediaQueryList | undefined;

	onMount(() => {
		// Canvasにクリックイベントを登録
		canvas.addEventListener("pointerdown", onPointerDown);

		syncDotColor();
		themeObserver = new MutationObserver(syncDotColor);
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});
		colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
		colorSchemeQuery.addEventListener("change", syncDotColor);
	});

	onDestroy(() => {
		// Canvasからクリックイベントを解除
		canvas.removeEventListener("pointerdown", onPointerDown);
		themeObserver?.disconnect();
		colorSchemeQuery?.removeEventListener("change", syncDotColor);
	});
</script>

<!-- Helper grid
<T.GridHelper
	args={[100, 10]}
	position={[0, 0, 0]}
/>-->

<T.OrthographicCamera
	makeDefault
	position={[0, 1, 0]}
	oncreate={(ref) => {
		ref.lookAt(0, 0, 0);
		ref.right = camRight;
		ref.left = camLeft;
		ref.top = camTop;
		ref.bottom = camBottom;
		ref.zoom = 1;
		ref.updateProjectionMatrix();
	}}
/>

<T.Mesh>
	<T.PlaneGeometry args={[2, 2]} />
	<T.ShaderMaterial
		{fragmentShader}
		{vertexShader}
		{uniforms}
		glslVersion={GLSL3}
		transparent={true}
	/>
</T.Mesh>
