import { Game } from "./game";
import { Point } from "./point";
import { padRight, padLeft } from "./text-utility";

export class StatusLine {
    turns: number;
    scrap: number;

    constructor(private game: Game, private position: Point, private maxWidth: number, params?: any) {
        if (!params) {
            params = {};
        }
        this.turns = params.turns || 0;
        this.scrap = params.scrap || 0;
    }

    reset(): void {
        this.turns = 0;
        this.scrap = 0;
    }

    draw(): void {
        let text = `turns: ${padRight(this.turns.toString(), 6)} scrap: ${padRight(this.scrap.toString(), 6)}`;
        this.game.drawText(this.position, text, this.maxWidth);
    }
}