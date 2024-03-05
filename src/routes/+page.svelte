<script lang="ts">
	import Artifact from '$lib/components/Artifacts/Artifact.svelte';
	import { onMount } from 'svelte';
	import Tesseract from 'tesseract.js';

	let video: HTMLVideoElement;
	let previewImg: HTMLImageElement;

	let capturing = false;
	let scanning = false;
	let resolutionSelection: number;
	$: resolution = resolutions[resolutionSelection];
	let relicText = '';
	let relics = [];

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	let showFAQ = false;

	interface Resolution {
		full: Rectangle;
		preview: Rectangle;
		piece: Rectangle;
		stats: Rectangle;
		set: Rectangle;
	}

	interface Rectangle {
		left: number;
		top: number;
		width: number;
		height: number;
	}

	const resolutions: Resolution[] = [
		{
			full: { left: 0, top: 0, width: 1920, height: 1080 },
			preview: { left: 1400, top: 134, width: 447, height: 511 },
			piece: { left: 1400, top: 134, width: 447, height: 30 },
			stats: { left: 1445, top: 400, width: 400, height: 190 },
			set: { left: 1400, top: 610, width: 447, height: 29 }
		},
		{
			full: { left: 0, top: 0, width: 1600, height: 900 },
			preview: { left: 1165, top: 140, width: 377, height: 430 },
			piece: { left: 1165, top: 140, width: 377, height: 27 },
			stats: { left: 1205, top: 365, width: 330, height: 155 },
			set: { left: 1169, top: 542, width: 337, height: 23 }
		}
	];

	async function startCapture() {
		try {
			const stream = await navigator.mediaDevices.getDisplayMedia({
				video: {
					displaySurface: 'window'
				},
				audio: false
			});
			video.srcObject = stream;
			stream.getVideoTracks()[0].addEventListener('ended', () => stopCapture());
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
		scanning = true;
		previewImg.src = videoToURL(resolution['stats']);

		const screenURI = videoToURL(resolution['full']);

		const rectNames: (keyof Resolution)[] = ['piece', 'stats', 'set'];

		const [piece, stats, set] = await parse(
			screenURI,
			Object.values(rectNames.map((rectName) => resolution[rectName]))
		);

		const relic = {
			piece: piece.data.text,
			stats: stats.data.text.split('\n'),
			set: set.data.text
		};

		relics = [...relics, relic];

		relicText = '';
		relicText += relic.piece;
		relicText += relic.stats.join('\n');
		scanning = false;
	}

	async function parse(imgURI: string, rects: Rectangle[]) {
		return await Promise.all(
			rects.map((rect) => scheduler.addJob('recognize', imgURI, { rectangle: rect }))
		);
	}

	function videoToURL(rect: Rectangle) {
		canvas.width = rect.width;
		canvas.height = rect.height;
		ctx.drawImage(
			video,
			rect.left,
			rect.top,
			rect.width,
			rect.height,
			0,
			0,
			rect.width,
			rect.height
		);
		return canvas.toDataURL('img/png');
	}

	onMount(() => {
		canvas = document.createElement('canvas');
		ctx = canvas.getContext('2d');

		video.addEventListener('playing', (e) => {
			const width = video.videoWidth;
			const height = video.videoHeight;
			const z = width * height;

			// Find closest resolution
			const closestResolution = resolutions.reduce((a, b, i) => {
				const c = resolutions[a]['full']['width'] * resolutions[a]['full']['height'];
				const d = b['full']['width'] * b['full']['height'];
				return Math.abs(d - z) < Math.abs(c - z) ? i : a;
			}, 0);
			resolutionSelection = closestResolution;
		});
	});

	// Tesseract stuff

	const scheduler = Tesseract.createScheduler();

	(async () => {
		const numWorkers = 3;
		[...Array(numWorkers)].forEach(async (_, i) => {
			scheduler.addWorker(await Tesseract.createWorker('eng'));
		});
	})();
</script>

<div class="h-full w-full flex flex-col">
	<div class="flex flex-col items-center p-4 gap-4 bg-zinc-800">
		<div class="flex flex-row justify-center items-center gap-4" class:hidden={!capturing}>
			<div class="flex flex-col gap-2 items-center h-full p-2 rounded-md bg-zinc-700 shadow-md">
				<h2><b>Game window</b></h2>
				<video bind:this={video} autoplay muted class="max-h-72 border-0 border-zinc-200">
					<track kind="captions" />
				</video>
			</div>
			<div class="flex flex-col gap-2 items-center h-full p-2 rounded-md bg-zinc-700 shadow-md">
				<h2><b>Scan preview</b></h2>
				<img bind:this={previewImg} class="max-h-72 w-auto" />
			</div>
			<!-- <pre>{relicText}</pre> -->
		</div>
		{#if !capturing}
			<div class="flex flex-col gap-4 max-w-lg w-full">
				<h1 class="text-center text-3xl"><b>Artifact Cam</b></h1>
				<p>
					Welcome to Artifact Cam, a tool for scanning artifacts in <i>Genshin Impact</i>
					and relics in <i>Honkai: Star Rail</i>. It works right here in your browser, no download
					required!
				</p>
				<p>
					To start, you will need to share your game window with the browser. Press the "Start
					Capture" button below then select it to get started.
				</p>
			</div>
		{/if}
		<div class="flex flex-col justify-center gap-2">
			<div class="flex flex-row justify-center gap-2">
				{#if !capturing}
					<button on:click={startCapture} class="rounded-md p-2 bg-green-700 shadow-md">
						Start Capture
					</button>
				{:else}
					<button on:click={stopCapture} class="rounded-md p-2 bg-red-700 shadow-md">
						Stop capture
					</button>
					<select bind:value={resolutionSelection} class="rounded-md p-2 bg-purple-700 shadow-md">
						{#each resolutions as res, i}
							<option value={i}>{res['full']['width']}×{res['full']['height']}</option>
						{/each}
					</select>
				{/if}
				<button
					on:click={() => {
						showFAQ = !showFAQ;
					}}
					class="rounded-md p-2 bg-yellow-700 shadow-md"
					class:bg-yellow-800={showFAQ}
				>
					{#if showFAQ}Hide FAQ
					{:else}FAQ{/if}
				</button>
			</div>
			{#if capturing}
				<button
					on:click={scan}
					disabled={scanning}
					class="rounded-md p-2 bg-blue-700 shadow-md"
					class:bg-blue-800={scanning}>Scan</button
				>
			{/if}
		</div>
		{#if showFAQ}
			<div class="flex flex-col gap-4 max-w-lg w-full p-4 rounded-md bg-zinc-700 shadow-md">
				<h1 class="text-center text-xl"><b>FAQ</b></h1>
				<div>
					<h2><b>I can't screenshare the game window</b></h2>
					<ul class="list-disc list-inside">
						<li>Open the window then come back to this tab. Then it should appear.</li>
						<li>
							If you're playing in fullscreen, go to windowded mode first then you can go back to
							fullscreen after you select it.
						</li>
					</ul>
				</div>
				<div>
					<h2><b>The artifact isn't scanning</b></h2>
					<ul class="list-disc list-inside">
						<li>
							Make sure the selected resolution matches the resolution of your game. You can check
							your resolution in the settings.
						</li>
						<li>
							If you are using a lower resolution than your monitor but in fullscreen, press
							<kbd>alt</kbd> + <kbd>enter</kbd> to go to windowed mode.
						</li>
					</ul>
				</div>
			</div>
		{/if}
	</div>
	<div class="flex flex-col p-4 gap-4">
		<h1 class="text-3xl"><b>Inventory</b></h1>
	</div>
	<div class="flex gap-4 flex-wrap p-4">
		{#each relics as artifact}
			<Artifact {artifact} />
		{/each}
	</div>
</div>
