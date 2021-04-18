import { Game } from "./game";
import { Point } from "./point";
import { padRight, padLeft } from "./text-utility";

export class StatusLine {
    constructor(private game: Game, private position: Point, private maxWidth: number, params?: any) {
        if (!params) {
            params = {};
        }
    }

    reset(): void {
    }

    draw(): void {
        const gameState = this.game.gameState;
        let text = `turns: ${padRight(gameState.steps.toString(), 6)} scrap: ${padRight(gameState.scrap.toString(), 6)}`;
        this.game.drawText(this.position, text, this.maxWidth);
    }
}