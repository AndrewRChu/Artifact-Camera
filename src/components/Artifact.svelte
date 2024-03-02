<script lang="ts">
	export let artifact: { piece: string; stats: string[]; set: string };
</script>

<div class="flex flex-col border border-zinc-400">
	<span>{artifact.piece}</span>
	{#each artifact.stats as stat}
		<span>{stat}</span>
	{/each}
</div>
