<script lang="ts">
	import Relic from '$lib/components/Artifacts/Relic.svelte';
	import Scanner from './Scanner.svelte';

	let relics = [];
</script>

<div class="h-full w-full flex flex-col">
	<div class="bg-zinc-800">
		<Scanner bind:relics />
	</div>
	<div class="flex flex-col p-4 gap-4">
		<h1 class="text-3xl"><b>Inventory</b></h1>
		<div class="flex gap-2 flex-wrap">
			{#each relics as relic}
				<Relic {relic} />
			{/each}
		</div>
	</div>
</div>
