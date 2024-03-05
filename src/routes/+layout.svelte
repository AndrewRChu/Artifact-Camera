<script>
	import '../app.css';
</script>

<svelte:head>
	<title>Artifact Cam</title>
	<meta
		name="description"
		content="An artifact and relic scanner for Genshin Impact and Honkai: Star Rail that works right in your browser!"
	/>
</svelte:head>
<div class="w-screen h-screen bg-zinc-700 text-zinc-100 overflow-y-scroll">
	<slot />
</div>
