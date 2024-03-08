<script lang="ts">
	import { relicSetsData } from '../../../stores';
	export let relic: { piece: string; stats: string[]; set: string };

	const setPieces = $relicSetsData[relic.set]['pieces'];
	const pieceType = Object.keys(setPieces).filter(
		(pieceType) => setPieces[pieceType].name == relic.piece
	)[0];

	let imgSrc = setPieces[pieceType]['icon'];

	function shortenStatName(name) {
		if (name.includes('Boost')) {
			return name.split(' ').slice(0, 2).join(' ');
		} else {
			return name;
		}
	}
</script>

<!-- <div class="bg-gradient-to-b from-amber-500 to-zinc-800 p-[1px] rounded-md shadow-md"> -->
<div class="flex flex-col bg-zinc-800 rounded-md p-2 w-48 shadow-md">
	<img width="64px" height="64px" src={imgSrc} alt={relic.piece} class="self-center" />
	{#each relic.stats as stat, i}
		<div
			class="flex justify-between items-center"
			class:font-bold={i == 0}
			class:bg-zinc-700={i == 0}
			class:px-1={i == 0}
		>
			<span>{shortenStatName(stat.name)}</span>
			<span>{stat.value}</span>
		</div>
	{/each}
</div>
<!-- </div> -->
