<script lang="ts">
	import '../app.css';
	import { relicSetsData } from '../stores';

	(async () => {
		const data = await fetch(
			'https://raw.githubusercontent.com/kel-z/HSR-Data/main/output/game_data_verbose_with_icons.json'
		);

		$relicSetsData = (await data.json())['relic_sets'];
	})();
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
