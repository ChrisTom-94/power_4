import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Color, Vector3, Scene, Mesh, MeshToonMaterial, InstancedMesh, Object3D, BufferGeometry, InstancedBufferAttribute, DynamicDrawUsage } from "three";
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const X_START = -2.25;
const GAP = 0.7;
const Y_START = -1.1;
const NB_COLUMNS = 7;
const NB_ROWS = 6;
const CELLS = NB_COLUMNS * NB_ROWS;

const COLORS = [0xff0000, 0xffff00];

type Player = {
    color: Color;
}

type Piece = {
    case: [number, number];
    color: Color;
}

export default class Board {
    players: [Player, Player];
    current_player = 0;
    pieces: Piece[];

    piece: Object3D = new Object3D();
    instanced_mesh: InstancedMesh | null;
    piece_destination: Vector3 = new Vector3();
    current_piece = 0;
    is_inserting = false;

    constructor(public scene: Scene) {
        this.players = [{ color: new Color(0xff0000) }, { color: new Color(0xffff00) }]
        this.pieces = [];
        this.instanced_mesh = null;

        const loader = new GLTFLoader();
        this.loadBoard(loader);
        this.loadPiece(loader);

        window.addEventListener('keydown', this.onKeydown.bind(this));
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
        loader.load('assets/models/piece.glb', (glb) => {
            const model = glb.scene.getObjectByName('piece') as Mesh;

            const geometries : BufferGeometry[] = [];
            model.traverse((child) => {
                if (!(child instanceof Mesh)) return;
                const geometry = child.geometry as BufferGeometry;
                geometries.push(geometry);
            });

            const mergedGeometry = mergeBufferGeometries(geometries);

            this.instanced_mesh = new InstancedMesh(mergedGeometry, new MeshToonMaterial(), CELLS);

            this.piece.scale.set(0.5, 0.5, 0.5);
            this.piece.rotation.x = Math.PI / 2;
            this.piece.position.z = 0;
            this.piece.position.x = X_START + (GAP * 0);
            this.piece.position.y = Y_START + (GAP * NB_ROWS);
            this.piece.userData.case = [0, NB_ROWS];
            this.piece.updateMatrix();

            const color = new Color();

            for(let i = 0; i < CELLS; i++){
                color.setHex(COLORS[i % 2]);
                this.instanced_mesh.setColorAt(i, color);
                this.instanced_mesh.setMatrixAt(i, this.piece.matrix);
            }

            this.instanced_mesh.instanceMatrix.needsUpdate = true;
            this.instanced_mesh.instanceMatrix.setUsage( DynamicDrawUsage );

            this.instanced_mesh.count = 1;

            this.scene.add(this.instanced_mesh);

        });
    }

    onKeydown(event: KeyboardEvent) {

        if(this.is_inserting || !this.piece) return;

        if (event.key == 'ArrowDown') {
            this.insertPiece();
            return;
        }

        if (event.key == 'ArrowLeft') this.piece.userData.case[0] -= 1;
        if (event.key == 'ArrowRight') this.piece.userData.case[0] += 1;

        this.piece.userData.case[0] = Math.max(0, Math.min(6, this.piece.userData.case[0]));

        this.movePiece();
    }

    movePiece() {
        if (!this.piece || !this.instanced_mesh) return;

        const [column] = this.piece.userData.case;
        this.piece.position.x = X_START + (GAP * column);

        this.piece.updateMatrix();
        this.instanced_mesh?.setMatrixAt(this.current_piece, this.piece.matrix);
        this.instanced_mesh.instanceMatrix.needsUpdate = true;
    }

    insertPiece() {
        if (!this.piece) return;

        const [column] = this.piece.userData.case;
        const same_column = this.pieces.filter(({case:[other_column]}) => other_column === column);
        const dest_column = same_column.length;

        const dest_position = new Vector3(this.piece.position.x, Y_START + (GAP * dest_column), 0);
        this.piece_destination = dest_position;

        this.pieces.push({case: this.piece.userData.case, color: this.players[this.current_player].color});

        this.is_inserting = true;
    }

    switch_player(){

        if(!this.instanced_mesh) return;

        this.current_player = (this.current_player + 1) % 2;

        this.instanced_mesh.count++;
        this.current_piece++;

        this.piece.position.x = X_START + (GAP * 0);
        this.piece.position.y = Y_START + (GAP * NB_ROWS);
        this.piece.userData.case = [0, NB_ROWS];

        this.piece.updateMatrix();
        this.instanced_mesh.setMatrixAt(this.current_piece, this.piece.matrix);
        this.instanced_mesh.instanceMatrix.needsUpdate = true;

    }

    update() {

        if(!this.is_inserting || !this.instanced_mesh) return;

        this.piece.position.lerp(this.piece_destination, 0.05);
        this.piece.updateMatrix();
        this.instanced_mesh.setMatrixAt(this.current_piece, this.piece.matrix);
        this.instanced_mesh.instanceMatrix.needsUpdate = true;

        if (this.piece.position.distanceTo(this.piece_destination) > 0.01) return;
        
        this.is_inserting = false;
        this.switch_player();
    }
}