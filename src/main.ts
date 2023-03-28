import './style.css';
import {Scene, WebGLRenderer, PerspectiveCamera, Mesh, BoxGeometry, MeshBasicMaterial} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import WebGL from "three/examples/jsm/capabilities/WebGL.js"

let support = false;
let not_supported = document.getElementById('not-supported');

// check if the browser supports webgl
if (!WebGL.isWebGLAvailable()) {
    support = false;
    not_supported && (not_supported.style.display = 'block');
}

if(support) {
  (() => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      const scene  = new Scene();
      
      const camera = new PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);
      camera.position.z = 5;
      
      const renderer = new WebGLRenderer();
      renderer.setSize(windowWidth, windowHeight);
      document.body.appendChild(renderer.domElement);
      
      const controls = new OrbitControls(camera, renderer.domElement);
      
      const mesh = new Mesh(
          new BoxGeometry(1, 1, 1),
          new MeshBasicMaterial({color: 0x00ff00})
      );
      
      scene.add(mesh);
      const animate = () => {
          requestAnimationFrame(animate)
          renderer.render(scene, camera)
          controls.update()
      }
      animate()
  })();
}




