import './style.css';
import { Scene, 
        WebGLRenderer, 
        PerspectiveCamera, 
        AmbientLight, 
        DirectionalLight,
        Color, 
        Vector3,
        PlaneGeometry,
        MeshStandardMaterial,
        Mesh,
        DoubleSide
    } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import WebGL from "three/examples/jsm/capabilities/WebGL.js";
import Board from './classes/Board';

let support = true;
let not_supported = document.getElementById('not-supported');
let ui = document.getElementById('ui');
let win_windows = document.getElementById('win-windows');
let winner = document.getElementById('winner');

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

        const plane_geometry = new PlaneGeometry(100, 100, 32, 32);
        const plane_material = new MeshStandardMaterial({color: 0x000000, wireframe: true, wireframeLinewidth: 10});
        const plane = new Mesh(plane_geometry, plane_material);
        plane.position.set(0, -2.3, 0);
        plane.rotation.x = Math.PI / 2;
        scene.add(plane);

        const board = new Board(scene, controls);

        const start_game = () => {
            is_playing = true;
            controls.autoRotate = false;
            controls.reset();
            board.is_playing = true;
            win_windows && (win_windows.style.display = 'none');
        }

        const reset_game = () => {
            start_game();
            board.reset();
        }

        const resize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }

        const on_win = (e: CustomEvent) => {
            is_playing = false;
            controls.autoRotate = true;
            win_windows && (win_windows.style.display = 'flex');
            winner && (winner.innerText = e.detail === "ff0000" ? "Red" : "Yellow");
            win_windows?.style.setProperty('--winner', `#${e.detail}`);
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

        start_button.addEventListener('click', start_game);
        reset_button.addEventListener('click', reset_game);
        window.addEventListener('resize', resize);
        window.addEventListener('win', (e) => on_win(e as CustomEvent));



    })();
}




