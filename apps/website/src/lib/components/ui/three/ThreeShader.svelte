<script lang="ts">
	import { Canvas } from "@threlte/core";
	import Scene from "./Scene.svelte";
    //import SceneTwo from './SceneTwo.svelte';
</script>

<div id="hero_bg">
	<Canvas>
		<Scene />
	</Canvas>
</div>

<style>
	#hero_bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100svh;
		z-index: 10;
		overflow: hidden;
	}
</style>
