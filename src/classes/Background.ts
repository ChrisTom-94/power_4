import { BoxGeometry, PlaneGeometry, ShaderMaterial, MeshStandardMaterial, Mesh, BackSide, Scene} from "three";
import background_vs from "../shaders/background.vert";
import background_fs from "../shaders/background.frag";

export default class Background {
    constructor(public scene: Scene) {
        const geometry = new BoxGeometry(100, 100, 100);
        const material = new ShaderMaterial({vertexShader: background_vs, fragmentShader: background_fs, side: BackSide});
        const skybox = new Mesh(geometry, material);
        this.scene.add(skybox);

        const plane_geometry = new PlaneGeometry(100, 100, 32, 32);
        const plane_material = new MeshStandardMaterial({color: 0x000000, wireframe: true});
        const plane = new Mesh(plane_geometry, plane_material);
        plane.position.set(0, -2.3, 0);
        plane.rotation.x = Math.PI / 2;
        this.scene.add(plane);
    }

    update() {
    }
}