import { Game } from "./game";
import { Actor, ActorType, Team } from "./actor";
import { Point } from "./point";
import { Glyph } from "./glyph";
import { Enemy } from "./enemy";

export class Bullet implements Actor {    
    glyph: Glyph;
    type: ActorType;    
    team: Team;

    constructor(private game: Game, public position: Point, team: Team) {
        this.type = ActorType.Bullet;
    }

    kill(): void {
        this.game.removeActor(this);
    }
    
    act(): Promise<any> {
        this.checkCollision();
        this.position.x++;
        this.checkCollision();

        if (this.position.x > this.game.gridSize.width-1) {
            this.game.removeActor(this);
        }

        return Promise.resolve();
    }

    private checkCollision() {
        let others = this.game.getActorsAtPosition(this.position);
        others.forEach(other => {
            let e = other as Enemy;
            if (e == null || e.dead) return;

            if (e.team != this.team) {
                this.kill();
                e.kill();
                // this.game.removeActor(other);
                this.game.messageLog.appendText("Shot hit at " + this.position);
            }
        });
    }
}