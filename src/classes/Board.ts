import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import {Piece, Player} from '../types';
import { Color, Vector3, Scene, Mesh, Material } from "three";

export default class Board {
    players: [Player, Player];
    pieces: Piece[];

    constructor(public scene: Scene) {
        this.players = [{color: new Color(0xff0000)}, {color: new Color(0xffff00)}]
        this.pieces = [];
        this.loadModel();
    }

    loadModel() {
        const loader = new ColladaLoader();
        loader.load('assets/models/board.dae', (collada) => {
            const model = collada.scene.getObjectByName('game') as Mesh;

            const material = model.material as Material;
            material.side = 2;

            model.matrixAutoUpdate = false;

            model.rotateOnWorldAxis(new Vector3(0, 1, 0), Math.PI / 2);
            model.updateMatrix();
            this.scene.add(model);
        });
    }
}