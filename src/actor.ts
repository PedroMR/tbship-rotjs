import { Point } from "./point";
import { Glyph } from "./glyph";

export const enum ActorType {
    Player,
    Pedro,
    TinyPedro,
    Bullet
}

export interface Actor {
    position: Point;
    glyph: Glyph;
    type: ActorType;

    act(): Promise<any>;
}