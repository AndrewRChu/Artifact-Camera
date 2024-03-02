<script lang="ts">
	import { onMount } from 'svelte';
	import Tesseract from 'tesseract.js';

	let video: HTMLVideoElement;
	let img: HTMLImageElement;

	let capturing = false;

	let resolution: string;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	let worker: Tesseract.Worker;

	const resolutions = [
		{ width: 1920, height: 1080, x: 1400, y: 130, w: 447, h: 510 },
		{ width: 1600, height: 900, x: 1165, y: 140, w: 377, h: 430 }
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
		let res = resolutions[parseInt(resolution)];
		const sx = res['x'];
		const sy = res['y'];
		const sWidth = res['w'];
		const sHeight = res['h'];

		canvas.width = sWidth;
		canvas.height = sHeight;

		ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
		const imgURI = canvas.toDataURL('image/png');
		img.src = imgURI;

		const ret = await worker.recognize(imgURI);
		console.log(ret.data.text);
	}

	onMount(() => {
		canvas = document.createElement('canvas');
		ctx = canvas.getContext('2d');

		video.addEventListener('playing', (e) => {
			const width = video.videoWidth;
			const height = video.videoHeight;
			canvas.width = width;
			canvas.height = height;
		});
	});

	(async () => {
		worker = await Tesseract.createWorker('eng');
	})();
</script>

<div class="h-full w-full flex flex-col">
	<div class="w-full flex flex-col items-center grow-1 p-4 gap-4 bg-zinc-800">
		<div class="flex flex-row justify-center items-center gap-4">
			<video bind:this={video} autoplay class="max-h-72 border-0 border-zinc-200">
				<track kind="captions" />
			</video>
			<img bind:this={img} class="max-h-72 w-auto" />
		</div>
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
	<div class="grow-1 p-2"></div>
</div>
