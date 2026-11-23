import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


function main() {

	const canvas = document.createElement('canvas');
	const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });

	renderer.setScissorTest(true);

	const sceneElements = [];
	function addScene(elem, fn) {

		const ctx = document.createElement('canvas').getContext('2d');
		elem.appendChild(ctx.canvas);
		sceneElements.push({ elem, ctx, fn });

	}

	function makeScene(elem) {

		const scene = new THREE.Scene();

		const fov = 45;
		const aspect = 2; // the canvas default
		const near = 0.1;
		const far = 5;
		const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		camera.position.set(0, 1, 2);
		camera.lookAt(0, 0, 0);
		scene.add(camera);

		const controls = new TrackballControls(camera, elem);
		controls.noZoom = true;
		controls.noPan = true;

		{

			const color = 0xFFFFFF;
			const intensity = 3;
			const light = new THREE.DirectionalLight(color, intensity);
			light.position.set(- 1, 2, 4);
			camera.add(light);

		}

		return { scene, camera, controls };

	}

	const sceneInitFunctionsByName = {
		'desk': (elem) => {

			const { scene, camera, controls } = makeScene(elem);

			// Extra fill light so the shadow side isn't black (GLB materials are usually PBR)
			scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));

			// Pivot group: rotating this spins the model around its own center
			const pivot = new THREE.Group();
			scene.add(pivot);

			new GLTFLoader().load(
				'resources/3d_models/Gordon_FinalDeskAssembly.glb',
				(gltf) => {

					const model = gltf.scene;

					// Scale to fit in roughly a 1.4 unit box (camera far plane is only 5)
					const box = new THREE.Box3().setFromObject(model);
					const size = box.getSize(new THREE.Vector3());
					const center = box.getCenter(new THREE.Vector3());
					const scale = 1.4 / Math.max(size.x, size.y, size.z);

					model.scale.setScalar(scale);
					model.position.copy(center).multiplyScalar(- scale); // center on origin

					pivot.add(model);

				},
				undefined,
				(err) => console.error('Could not load GLB:', err)
			);

			return (time, rect) => {

				pivot.rotation.y = time * .1;
				camera.aspect = rect.width / rect.height;
				camera.updateProjectionMatrix();
				controls.handleResize();
				controls.update();
				renderer.render(scene, camera);

			};

		},
		'tips': (elem) => {

			const { scene, camera, controls } = makeScene(elem);

			// Extra fill light so the shadow side isn't black (GLB materials are usually PBR)
			scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));

			// Pivot group: rotating this spins the model around its own center
			const pivot = new THREE.Group();
			scene.add(pivot);

			new GLTFLoader().load(
				'resources/3d_models/TipsSet1Assembly.glb',
				(gltf) => {

					const model = gltf.scene;

					// Scale to fit in roughly a 1.4 unit box (camera far plane is only 5)
					const box = new THREE.Box3().setFromObject(model);
					const size = box.getSize(new THREE.Vector3());
					const center = box.getCenter(new THREE.Vector3());
					const scale = 1.7 / Math.max(size.x, size.y, size.z);

					model.scale.setScalar(scale);
					model.position.copy(center).multiplyScalar(- scale); // center on origin

					pivot.add(model);

				},
				undefined,
				(err) => console.error('Could not load GLB:', err)
			);

			return (time, rect) => {

				pivot.rotation.y = time * .1;
				camera.aspect = rect.width / rect.height;
				camera.updateProjectionMatrix();
				controls.handleResize();
				controls.update();
				renderer.render(scene, camera);

			};

		},
		'stepped': (elem) => {

			const { scene, camera, controls } = makeScene(elem);

			// Extra fill light so the shadow side isn't black (GLB materials are usually PBR)
			scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));

			// Pivot group: rotating this spins the model around its own center
			const pivot = new THREE.Group();
			scene.add(pivot);

			new GLTFLoader().load(
				'resources/3d_models/Gordon_Stepped_part.glb',
				(gltf) => {

					const model = gltf.scene;

					// Scale to fit in roughly a 1.4 unit box (camera far plane is only 5)
					const box = new THREE.Box3().setFromObject(model);
					const size = box.getSize(new THREE.Vector3());
					const center = box.getCenter(new THREE.Vector3());
					const scale = 1.4 / Math.max(size.x, size.y, size.z);

					model.scale.setScalar(scale);
					model.position.copy(center).multiplyScalar(- scale); // center on origin

					pivot.add(model);

				},
				undefined,
				(err) => console.error('Could not load GLB:', err)
			);

			return (time, rect) => {

				pivot.rotation.y = time * .1;
				camera.aspect = rect.width / rect.height;
				camera.updateProjectionMatrix();
				controls.handleResize();
				controls.update();
				renderer.render(scene, camera);

			};

		},
	};

	document.querySelectorAll('[data-diagram]').forEach((elem) => {

		const sceneName = elem.dataset.diagram;
		const sceneInitFunction = sceneInitFunctionsByName[sceneName];
		const sceneRenderFunction = sceneInitFunction(elem);
		addScene(elem, sceneRenderFunction);

	});

	function render(time) {

		time *= 0.001;

		for (const { elem, fn, ctx } of sceneElements) {

			// get the viewport relative position of this element
			const rect = elem.getBoundingClientRect();
			const { left, right, top, bottom, width, height } = rect;
			const rendererCanvas = renderer.domElement;

			const isOffscreen =
				bottom < 0 ||
				top > window.innerHeight ||
				right < 0 ||
				left > window.innerWidth;

			if (!isOffscreen) {

				// make sure the renderer's canvas is big enough
				if (rendererCanvas.width < width || rendererCanvas.height < height) {

					renderer.setSize(width, height, false);

				}

				// make sure the canvas for this area is the same size as the area
				if (ctx.canvas.width !== width || ctx.canvas.height !== height) {

					ctx.canvas.width = width;
					ctx.canvas.height = height;

				}

				renderer.setScissor(0, 0, width, height);
				renderer.setViewport(0, 0, width, height);

				fn(time, { width, height });

				// copy the rendered scene to this element's canvas
				ctx.globalCompositeOperation = 'copy';
				ctx.drawImage(
					rendererCanvas,
					0, rendererCanvas.height - height, width, height, // src rect
					0, 0, width, height); // dst rect

			}

		}

		requestAnimationFrame(render);

	}

	requestAnimationFrame(render);

}

main();
