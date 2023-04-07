import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Color, Vector3, Scene, Mesh, MeshToonMaterial, InstancedMesh, Object3D, BufferGeometry, DynamicDrawUsage } from "three";
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const X_START = -2.25;
const GAP = 0.7;
const Y_START = -1.1;
const NB_COLUMNS = 7;
const NB_ROWS = 6;
const CELLS = NB_COLUMNS * NB_ROWS;
const PIECE_SCALE = 0.65;

const COLORS = [0xff0000, 0xffff00];

type Player = {
    color: Color;
}

type Piece = {
    case: [number, number];
    color: Color;
}

const red_player = document.getElementById('red-player') as HTMLDivElement;
const yellow_player = document.getElementById('yellow-player') as HTMLDivElement;
const players_elements = [red_player, yellow_player];

export default class Board{
    players: [Player, Player];
    current_player = 0;
    pieces: Piece[];

    piece: Object3D = new Object3D();
    instanced_mesh: InstancedMesh | null;
    piece_destination: Vector3 = new Vector3();
    current_piece = 0;
    is_inserting = false;

    is_playing = false;

    constructor(public scene: Scene, public controls: OrbitControls) {
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

            this.piece.scale.set(PIECE_SCALE, PIECE_SCALE, PIECE_SCALE);
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

        if(this.is_inserting || !this.piece || !this.is_playing) return;

        if (event.key == 'ArrowDown') {
            this.insertPiece();
            return;
        }

        let controls_rotation = this.controls.getAzimuthalAngle();

        if (controls_rotation > Math.PI / 2 && controls_rotation < 3 * Math.PI / 2) {
            if (event.key == 'ArrowLeft') this.piece.userData.case[0] += 1;
            if (event.key == 'ArrowRight') this.piece.userData.case[0] -= 1;
        } else {
            if (event.key == 'ArrowLeft') this.piece.userData.case[0] -= 1;
            if (event.key == 'ArrowRight') this.piece.userData.case[0] += 1;
        }

        this.piece.userData.case[0] = Math.max(0, Math.min(6, this.piece.userData.case[0]));

        this.movePiece();
    }

    movePiece() {
        if (!this.piece || !this.instanced_mesh || !this.is_playing) return;

        let [column] = this.piece.userData.case;

        this.piece.position.x = X_START + (GAP * column);

        this.piece.updateMatrix();
        this.instanced_mesh?.setMatrixAt(this.current_piece, this.piece.matrix);
        this.instanced_mesh.instanceMatrix.needsUpdate = true;
    }

    insertPiece() {
        if (!this.piece) return;

        const [column] = this.piece.userData.case;
        const same_column = this.pieces.filter(({case:[other_column]}) => other_column === column);

        if(same_column.length >= NB_ROWS) return;

        const dest_row = same_column.length;

        const dest_position = new Vector3(this.piece.position.x, Y_START + (GAP * dest_row), 0);
        this.piece_destination = dest_position;

        this.piece.userData.case = [column, dest_row];
        this.pieces.push({case: [column, dest_row], color: this.players[this.current_player].color});

        this.is_inserting = true;
    }

    switch_player(){

        if(!this.instanced_mesh) return;

        players_elements[this.current_player].classList.remove('current');
        this.current_player = (this.current_player + 1) % 2;
        players_elements[this.current_player].classList.add('current');

        this.instanced_mesh.count++;
        this.current_piece++;

        this.piece.position.x = X_START + (GAP * 0);
        this.piece.position.y = Y_START + (GAP * NB_ROWS);
        this.piece.userData.case = [0, NB_ROWS];

        this.piece.updateMatrix();
        this.instanced_mesh.setMatrixAt(this.current_piece, this.piece.matrix);
        this.instanced_mesh.instanceMatrix.needsUpdate = true;
    }

    check_for_win(){
        const player_color = this.players[this.current_player].color;
        const [column, row] = this.piece.userData.case;

        const same_color = this.pieces.filter(({color}) => player_color === color);
        
        const same_column = same_color.filter(({case:[other_column]}) => other_column === column);

        let has_won = false;
        
        if(same_column.length >= 4){
            const sorted = same_column.sort((a, b) => a.case[1] - b.case[1]).map(({case:[, row]}) => row);
            for(let i = 0; i < sorted.length - 3; i++){
                const sliced = sorted.slice(i, i + 4);
                if(sliced[3] - sliced[0] !== 3) continue;
                has_won = true;
                break;
            }
        }

        if(has_won) return has_won;

        const same_row = same_color.filter(({case:[, other_row]}) => other_row === row);

        if(same_row.length >= 4){
            const sorted = same_row.sort((a, b) => a.case[0] - b.case[0]).map(({case:[column]}) => column);
            for(let i = 0; i < sorted.length - 3; i++){
                const sliced = sorted.slice(i, i + 4);
                if(sliced[3] - sliced[0] !== 3) continue;
                has_won = true;
                break;
            }
        }

        if(has_won) return has_won;

        const same_diagonal = same_color.filter(({case:[other_column, other_row]}) => Math.abs(other_column - column) === Math.abs(other_row - row));

        if(same_diagonal.length >= 4){
            const sorted = same_diagonal.sort((a, b) => a.case[0] - b.case[0])
            for(let i = 0; i < sorted.length - 3; i++){
                const sliced = sorted.slice(i, i + 4);
                if(!(Math.abs(sliced[3].case[0] - sliced[0].case[0]) === 3 && Math.abs(sliced[3].case[1] - sliced[0].case[1]) === 3)) continue;
                has_won = true;
                break;
            }
        }

        return has_won;
    }

    reset(){
        this.pieces = [];
        players_elements[this.current_player].classList.remove('current');
        this.current_player = 0;
        players_elements[this.current_player].classList.add('current');
        this.current_piece = 0;
        this.is_inserting = false;
        this.piece_destination.set(0, 0, 0);
        this.piece.position.x = X_START + (GAP * 0);
        this.piece.position.y = Y_START + (GAP * NB_ROWS);
        this.piece.userData.case = [0, NB_ROWS];

        this.piece.updateMatrix();

        if (!this.instanced_mesh) return 
        this.instanced_mesh.count = 1;
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
        if(this.check_for_win()){
            dispatchEvent(new CustomEvent('win', {detail: this.players[this.current_player].color.getHexString()}));
            return;
        }
        this.switch_player();
    }
}