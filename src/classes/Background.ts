import { BoxGeometry, ShaderMaterial, Mesh, BackSide, Scene} from "three";
import vertexShader from "../shaders/background.vert";
import fragmentShader from "../shaders/background.frag";

export default class Background {
    constructor(public scene: Scene) {
        const geometry = new BoxGeometry(100, 100, 100);
        const material = new ShaderMaterial({vertexShader, fragmentShader, side: BackSide});
        const mesh = new Mesh(geometry, material);
        this.scene.add(mesh);
    }

    update() {
    }
}