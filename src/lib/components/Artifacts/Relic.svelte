<script lang="ts">
	import relics from '$lib/relics.json';
	export let relic: { piece: string; stats: string[]; set: string };
</script>

<!-- <div class="bg-gradient-to-b from-amber-500 to-zinc-800 p-[1px] rounded-md shadow-md"> -->
<div class="flex flex-col bg-zinc-800 rounded-md p-2 w-48 shadow-md">
	{#each relic.stats as stat, i}
		<div class="flex justify-between items-center" class:font-bold={i == 0}>
			<span>{stat.name}</span>
			<span>{stat.value}</span>
		</div>
	{/each}
</div>
<!-- </div> -->
