<script lang="ts">
	import Artifact from '../components/Artifact.svelte';
	import { onMount } from 'svelte';
	import Tesseract from 'tesseract.js';

	let video: HTMLVideoElement;
	let img: HTMLImageElement;
	let pieceImg: HTMLImageElement;
	let statsImg: HTMLImageElement;
	let setImg: HTMLImageElement;

	let capturing = false;
	let resolution: string;
	let artifactText = '';
	let artifacts = [];

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	let worker: Tesseract.Worker;

	const resolutions = [
		{
			width: 1920,
			height: 1080,
			preview: { x: 1400, y: 134, w: 447, h: 511 },
			piece: { x: 1400, y: 134, w: 447, h: 30 },
			stats: { x: 1445, y: 400, w: 400, h: 190 },
			set: { x: 1400, y: 610, w: 447, h: 29 }
		},
		{
			width: 1600,
			height: 900,
			preview: { x: 1165, y: 140, w: 377, h: 430 },
			piece: { x: 1165, y: 140, w: 377, h: 27 },
			stats: { x: 1205, y: 365, w: 330, h: 155 },
			set: { x: 1169, y: 542, w: 337, h: 23 }
		}
	];

	async function startCapture() {
		try {
			video.srcObject = await navigator.mediaDevices.getDisplayMedia({
				video: {
					displaySurface: 'window'
				},
				audio: false
			});
			capturing = true;
		} catch (err) {
			console.error(err);
		}
	}

	function stopCapture() {
		if (video.srcObject) {
			video.srcObject.getTracks().forEach((track) => track.stop());
			video.srcObject = null;
			capturing = false;
		}
	}

	async function scan() {
		const imgURI = videoToURL('preview');
		img.src = imgURI;

		const artifact = await {
			piece: (await parse('piece')).data.text,
			stats: (await parse('stats')).data.text.split('\n'),
			set: (await parse('set')).data.text
		};

		artifacts = [...artifacts, artifact];

		artifactText = '';
		artifactText += artifact.piece;
		artifactText += artifact.stats.join('\n');
	}

	async function parse(rect: string) {
		const imgURI = videoToURL(rect);
		const ret = await worker.recognize(imgURI);
		console.log(ret);
		return ret;
	}

	function videoToURL(rect: string) {
		const res = resolutions[parseInt(resolution)];
		canvas.width = res[rect].w;
		canvas.height = res[rect].h;
		ctx.drawImage(
			video,
			res[rect].x,
			res[rect].y,
			res[rect].w,
			res[rect].h,
			0,
			0,
			res[rect].w,
			res[rect].h
		);
		return canvas.toDataURL('img/png');
	}

	onMount(() => {
		canvas = document.createElement('canvas');
		ctx = canvas.getContext('2d');
	});

	(async () => {
		worker = await Tesseract.createWorker('eng');
	})();
</script>

<div class="h-full w-full flex flex-col">
	<div class="w-full flex flex-col items-center grow-1 p-4 gap-4 bg-zinc-800">
		<div class="flex flex-row justify-center items-center gap-4" class:hidden={!capturing}>
			<video bind:this={video} autoplay class="max-h-72 border-0 border-zinc-200">
				<track kind="captions" />
			</video>
			<div class="flex flex-col gap-4">
				<img bind:this={img} class="max-h-72 w-auto" />
			</div>
			<pre>{artifactText}</pre>
		</div>
		{#if !capturing}
			<div class="max-w-xl">
				<p>
					Welcome to Artifact Cam, a tool for scanning artifacts in <i>Genshin Impact</i> and
					<i>Honkai: Star Rail</i>.
				</p>
			</div>
		{/if}
		<div class="flex flex-row justify-center gap-2">
			{#if !capturing}
				<button on:click={startCapture} class="rounded-md p-2 bg-green-700 shadow-md">
					Start capture
				</button>
			{:else}
				<button on:click={stopCapture} class="rounded-md p-2 bg-red-700 shadow-md"
					>Stop capture
				</button>
				<select bind:value={resolution} class="rounded-md p-2 bg-yellow-700 shadow-md">
					{#each resolutions as res, i}
						<option value={i}>{res['width']}×{res['height']}</option>
					{/each}
				</select>
				<button on:click={scan} class="rounded-md p-2 bg-blue-700 shadow-md">Scan</button>
			{/if}
		</div>
	</div>
	<div class="grow-1 p-4">
		<div class="flex gap-4 flex-wrap">
			{#each artifacts as artifact}
				<Artifact {artifact} />
			{/each}
		</div>
	</div>
</div>
