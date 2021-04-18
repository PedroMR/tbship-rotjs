import { Point } from "./point";
import { Glyph } from "./glyph";

export const enum ActorType {
    Player,
    Pedro,
    TinyPedro,
    Bullet
}

export const enum Team {
    Player,
    Enemies
}

export interface Actor {
    position: Point;
    glyph: Glyph;
    type: ActorType;
    team: Team;

    act(): Promise<any>;
    kill(): void;
}