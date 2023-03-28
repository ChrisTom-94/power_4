import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Piece, Player } from '../types';
import { Color, Vector3, Scene, Mesh, MeshToonMaterial } from "three";

const x_start = -1.9;
const x_gap = 0.7;
const y_start = -1.1;
const y_gap = 0.7;

export default class Board {
    players: [Player, Player];
    current_player = 0;
    pieces: Piece[];

    piece: Mesh = new Mesh();
    piece_destination: Vector3 = new Vector3();

    constructor(public scene: Scene) {
        this.players = [{ color: new Color(0xff0000) }, { color: new Color(0xffff00) }]
        this.pieces = [];

        const loader = new GLTFLoader();
        this.loadBoard(loader);
        this.loadPiece(loader);

        window.addEventListener('keydown', this.onKeydown.bind(this));
    }

    create_piece() {
        const piece = {
            color: this.players[this.current_player].color,
            case: [0, 6]
        }
    }


    loadBoard(loader: GLTFLoader) {
        loader.load('assets/models/board.glb', (object) => {
            const model = object.scene.getObjectByName('game') as Mesh;

            model.matrixAutoUpdate = false;

            model.rotateOnWorldAxis(new Vector3(0, 1, 0), Math.PI / 2);
            model.updateMatrix();

            model.material = new MeshToonMaterial({ color: 0x0000ff });
            model.material.side = 2;

            this.scene.add(model);
        });
    }

    loadPiece(loader: GLTFLoader) {
        loader.load('assets/models/piece.glb', (object) => {
            const model = object.scene.getObjectByName('piece') as Mesh;

            model.rotateOnWorldAxis(new Vector3(0, 1, 0), Math.PI / 2);

            model.position.z = 0;
            model.position.x = x_start + (x_gap * 0);
            model.position.y = y_start + (y_gap * 6);

            this.piece = model.clone();

            this.piece.traverse((child) => {
                if (child instanceof Mesh) {
                    const material = child.material as MeshToonMaterial;
                    material.side = 2;
                    material.color = this.players[this.current_player].color;
                }
            });

            this.piece.userData = {
                case: [0, 6]
            }

            this.piece_destination = this.piece.position.clone();

            this.scene.add(this.piece);
        });
    }

    onKeydown(event: KeyboardEvent) {

        if (event.key == 'ArrowDown') {
            this.insertPiece();
            return;
        }

        if (event.key == 'ArrowLeft') this.piece.userData.case[0] -= 1;
        if (event.key == 'ArrowRight') this.piece.userData.case[0] += 1;

        this.piece.userData.case[0] = Math.max(0, Math.min(6, this.piece.userData.case[0]));

        this.movePiece(this.piece.userData.case[0]);
    }

    movePiece(x: number) {
        this.piece.position.x = x_start + (x_gap * x);
        this.piece_destination = this.piece.position.clone();
    }

    insertPiece() {

        let [column] = this.piece.userData.case;

        let dest_column = this.pieces.reduce((acc, { case: [other_column, otherrow] }) =>
            (column === other_column) ? acc : Math.max(acc, otherrow), 0);

        let dest_position = new Vector3(this.piece.position.x, y_start + (y_gap * dest_column), 0);

        this.piece_destination = dest_position;

        this.piece.userData.case[1] = column;

        this.pieces.push({
            color: this.players[this.current_player].color,
            case: this.piece.userData.case
        });

        this.current_player = (this.current_player + 1) % 2;
    }

    update() {
        if(this.piece.position.distanceTo(this.piece_destination) > 0.01){
            this.piece.position.lerp(this.piece_destination, 0.05);
        }
    }
}