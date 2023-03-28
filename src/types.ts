import { Color } from "three";

export type Player = {
    color: Color;
}

export type Piece = {
    color: Color;
    case: [number, number];
}