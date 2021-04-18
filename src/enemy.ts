import { Actor, ActorType, Team } from "./actor";
import { Game } from "./game";
import { Glyph } from "./glyph";
import { Point } from "./point";

export class Enemy implements Actor {
    glyph: Glyph;
    type: ActorType;
    team: Team;
    dead: boolean;
    stepToDisappear: number;

    constructor(private game:Game, public position: Point) {
        this.team = Team.Enemies;
        this.glyph = new Glyph("g", "#f44");
    }

    act(): Promise<any> {
        if (this.dead && this.stepToDisappear <= this.game.gameState.steps)
        {
            this.game.removeActor(this);
        }
        else
        {
            this.position.x--;
        }

        return Promise.resolve();
    }

    kill(): void {
        this.glyph = new Glyph("*", this.glyph.foregroundColor);
        this.dead = true;
        this.stepToDisappear = this.game.gameState.steps + 1;
        this.game.gameState.scrap += 10;
    }

}
