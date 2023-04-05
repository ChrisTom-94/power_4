import './style.css';
import { Scene, 
        WebGLRenderer, 
        PerspectiveCamera, 
        AmbientLight, 
        DirectionalLight,
        Color, 
        Vector3
    } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import WebGL from "three/examples/jsm/capabilities/WebGL.js";
import Background from './classes/Background';
import Board from './classes/Board';

let support = true;
let not_supported = document.getElementById('not-supported');
let ui = document.getElementById('ui');

// check if the browser supports webgl
if (!WebGL.isWebGLAvailable()) {
    support = false;
    not_supported && (not_supported.style.display = 'block');
}

if (support) {
    (() => {

        if(ui) ui.style.display = 'flex';

        const reset_button = document.getElementById('reset') as HTMLButtonElement;
        const start_button = document.getElementById('start') as HTMLButtonElement;

        let is_playing = false;
        let reset_camera = false;

        const window_width = window.innerWidth;
        const window_height = window.innerHeight;

        const scene = new Scene();
        scene.background = new Color(0xFFFFFF);

        const camera = new PerspectiveCamera(75, window_width / window_height, 0.1, 1000);
        const camera_position = new Vector3(0, 0, 10);
        camera.position.copy(camera_position);

        const renderer = new WebGLRenderer();
        renderer.setSize(window_width, window_height);
        document.body.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.saveState();
        controls.enablePan = false;
        controls.enableRotate = false;

        const ambient = new AmbientLight(0x404040); // soft white light
        scene.add(ambient);

        const directional_light = new DirectionalLight(0xffffff, 0.5);
        directional_light.position.set(0, 15, 5);
        scene.add(directional_light);

        const background = new Background(scene);
        const board = new Board(scene, controls);

        const start_game = () => {
            is_playing = true;
            controls.autoRotate = false;
            reset_camera = true;
        }

        const resize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }

        const animate = () => {
            requestAnimationFrame(animate)
            renderer.render(scene, camera)
            controls.update()

            if (!is_playing) {
                controls.autoRotate = true;
                return;
            }

            if (reset_camera) {
                camera.position.lerp(camera_position, 0.1);
                if (camera.position.distanceTo(camera_position) > 0.1) return 
                reset_camera = false;
            }

            if(!controls.enableRotate) controls.enableRotate = true;

            board.update()
            background.update()
        }
        animate()

        window.addEventListener('resize', resize)

        start_button.addEventListener('click', () => {
            is_playing = true;
            controls.autoRotate = false;
            controls.reset();
        });

        reset_button.addEventListener('click', board.reset.bind(board));
    })();
}




