import './style.css';
import { Scene, 
        WebGLRenderer, 
        PerspectiveCamera, 
        AmbientLight, 
        DirectionalLight, 
        Color,
    } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import WebGL from "three/examples/jsm/capabilities/WebGL.js"
import Board from './classes/Board';

let support = true;
let not_supported = document.getElementById('not-supported');

// check if the browser supports webgl
if (!WebGL.isWebGLAvailable()) {
    support = false;
    not_supported && (not_supported.style.display = 'block');
}

if (support) {
    (() => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const scene = new Scene();
        scene.background = new Color(0xf0f0f0);

        const camera = new PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);
        camera.position.z = 10;

        const renderer = new WebGLRenderer();
        renderer.setSize(windowWidth, windowHeight);
        document.body.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;

        const ambient = new AmbientLight(0x404040); // soft white light
        scene.add(ambient);

        const directionalLight = new DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 15, 5);
        scene.add(directionalLight);

        const board = new Board(scene);

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
            board.update()

            if (board.is_playing) return;
            // automatically rotate the control 
            controls.autoRotate = true;

        }
        animate()

        window.addEventListener('resize', resize)
    })();
}




