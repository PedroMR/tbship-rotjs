import { Display, Scheduler, KEYS, RNG } from "rot-js/lib/index";
import Simple from "rot-js/lib/scheduler/simple";

import { Player } from "./player";
import { Point } from "./point";
import { Glyph } from "./glyph";
import { Actor, ActorType, Team } from "./actor";
import { Pedro } from "./pedro";
import { GameState } from "./game-state";
import { StatusLine } from "./status-line";
import { MessageLog } from "./message-log";
import { InputUtility } from "./input-utility";
import { Tile, TileType } from "./tile";
import { Map } from "./map";
import { Backdrop } from "./backdrop";
import { TinyPedro } from "./tiny-pedro";
import { Bullet } from "./bullet";
import { Enemy } from "./enemy";

export class Game {
    private display: Display;
    private scheduler: Simple;
    private map: Map;
    private backdrop: Backdrop;
    private statusLine: StatusLine;
    public messageLog: MessageLog;

    private player: Player;
    private enemies: Actor[];
    private actors: Actor[];

    public gridSize: { width: number, height: number };
    private cellSize: { width: number, height: number };
    private gameSize: { width: number, height: number };
    private mapSize: { width: number, height: number };
    private statusLinePosition: Point;
    private actionLogPosition: Point;
    public gameState: GameState;

    private pineapplePoint: Point;
    private pedroColor: string;
    private foregroundColor = "white";
    private backgroundColor = "black";
    private maximumBoxes = 10;

    constructor() {
        this.gridSize = { width: 15, height: 7 };
        this.cellSize = { width: 5, height: 3 };
        this.mapSize = { width: this.gridSize.width*this.cellSize.width,
                         height: this.gridSize.height*this.cellSize.height };
        this.gameSize = { width: this.mapSize.width, height: this.mapSize.height + 4 };
        this.statusLinePosition = new Point(0, this.gameSize.height - 4);
        this.actionLogPosition = new Point(0, this.gameSize.height - 3);

        this.display = new Display({
            width: this.gameSize.width,
            height: this.gameSize.height,
            fontSize: 20
        });
        document.body.appendChild(this.display.getContainer());

        this.gameState = new GameState();
        this.backdrop = new Backdrop(this);
        this.map = new Map(this);
        this.statusLine = new StatusLine(this, this.statusLinePosition, this.gameSize.width, { maxBoxes: this.maximumBoxes });
        this.messageLog = new MessageLog(this, this.actionLogPosition, this.gameSize.width, 3);
        this.pedroColor = new Pedro(this, new Point(0, 0)).glyph.foregroundColor;

        this.initializeGame();
        this.mainLoop();
    }

    draw(position: Point, glyph: Glyph): void {
        let foreground = glyph.foregroundColor || this.foregroundColor;
        let background = glyph.backgroundColor || this.backgroundColor;
        this.display.draw(position.x, position.y, glyph.character, foreground, background);
    }

    drawText(position: Point, text: string, maxWidth?: number): void {
        this.display.drawText(position.x, position.y, text, maxWidth);
    }

    mapIsPassable(x: number, y: number): boolean {
        return this.map.isPassable(x, y);
    }

    occupiedByEnemy(x: number, y: number): boolean {
        for (let enemy of this.enemies) {
            if (enemy.position.x == x && enemy.position.y == y) {
                return true;
            }
        }
        return false;
    }

    getPlayerPosition(): Point {
        return this.player.position;
    }
/*
    checkBox(x: number, y: number): void {
        switch (this.map.getTileType(x, y)) {
            case Tile.box.type:
                this.map.setTile(x, y, Tile.searchedBox);
                this.statusLine.boxes += 1;
                if (this.pineapplePoint.x == x && this.pineapplePoint.y == y) {
                    this.messageLog.appendText("Continue with 'spacebar' or 'return'.");
                    this.messageLog.appendText("Hooray! You found a pineapple.");
                    this.gameState.foundPineapple = true;
                } else {
                    this.messageLog.appendText("This box is empty.");
                }
                break;
            case Tile.searchedBox.type:
                this.map.setTile(x, y, Tile.destroyedBox);
                this.messageLog.appendText("You destroy this box!");
                break;
            case Tile.destroyedBox.type:
                this.messageLog.appendText("This box is already destroyed.");
                break;
            default:
                this.messageLog.appendText("There is no box here!");
                break;
        }
    }

    destroyBox(actor: Actor, x: number, y: number): void {
        switch (this.map.getTileType(x, y)) {
            case TileType.Box:
            case TileType.SearchedBox:
                this.map.setTile(x, y, Tile.destroyedBox);
                if (this.pineapplePoint.x == x && this.pineapplePoint.y == y) {
                    this.messageLog.appendText("Continue with 'spacebar' or 'return'.");
                    this.messageLog.appendText(`Game over - ${this.getActorName(actor)} detroyed the box with the pineapple.`);
                    this.gameState.pineappleWasDestroyed = true;
                } else {
                    this.messageLog.appendText(`${this.getActorName(actor)} detroyed a box.`);
                }
                break;
            case TileType.DestroyedBox:
                this.messageLog.appendText("This box is already destroyed.");
                break;
            default:
                this.messageLog.appendText("There is no box here!");
                break;
        }
    }
*/
    catchPlayer(actor: Actor): void {
        this.messageLog.appendText("Continue with 'spacebar' or 'return'.");
        this.messageLog.appendText(`Game over - you were captured by ${this.getActorName(actor)}!`);
        this.gameState.playerWasCaught = true;
    }

    getTileType(x: number, y: number): TileType {
        return this.map.getTileType(x, y);
    }

    getRandomTilePositions(type: TileType, quantity: number = 1): Point[] {
        return this.map.getRandomTilePositions(type, quantity);
    }

    private initializeGame(): void {
        this.display.clear();

        this.messageLog.clear();
        if (!this.gameState.isGameOver() || this.gameState.doRestartGame()) {
            this.resetStatusLine();
            this.writeHelpMessage();
        }
        this.gameState.reset();

        this.backdrop.generate(this.mapSize.width, this.mapSize.height);
        this.map.generateMap(this.gridSize.width, this.gridSize.height);

        this.createBeings();
        this.scheduler = new Scheduler.Simple();
        this.scheduler.add(this.player, true);
        for (let enemy of this.enemies) {
            this.scheduler.add(enemy, true);
        }

        this.drawPanel();
    }

    private async mainLoop(): Promise<any> {
        let actor: Actor;
        while (true) {
            actor = this.scheduler.next();
            if (!actor) {
                break;
            }

            await actor.act();
            if (actor.type === ActorType.Player) {
                this.gameState.steps += 1;
                this.backdrop.step();

                //TODO convert to "director"
                if (this.gameState.steps % 5 == 0) {
                    let pos = new Point(this.gridSize.width, 3);                
                    this.addActor(new Enemy(this, pos));
                }
            }

            this.drawPanel();

            if (this.gameState.isGameOver()) {
                await InputUtility.waitForInput(this.handleInput.bind(this));
                this.initializeGame();
            }
        }
    }

    private drawPanel(): void {
        this.display.clear();
        this.backdrop.draw();
        this.map.draw();
        this.statusLine.draw();
        this.messageLog.draw();
        this.drawActor(this.player);
        for (let actor of this.actors) {
            this.drawActor(actor);
        }

        for (let enemy of this.enemies) {
            this.draw(enemy.position, enemy.glyph);
        }
    }

    private drawActor(actor : Actor)
    {
        let pos = actor.position.clone();
        pos.x = pos.x * this.cellSize.width + this.cellSize.width/2;
        pos.y = pos.y * this.cellSize.height + this.cellSize.height/2;
        
        if (actor.type == ActorType.Bullet) {
            if (actor.team == Team.Player)
                pos.x--;
            else
                pos.x++;
        }

        this.draw(pos, actor.glyph);
    }

    private handleInput(event: KeyboardEvent): boolean {
        let code = event.keyCode;
        return code === KEYS.VK_SPACE || code === KEYS.VK_RETURN;
    }

    private writeHelpMessage(): void {
        let helpMessage = [
            `Move up and down with W and S. Shoot with D.`
            // `Find the pineapple in one of the %c{${Tile.box.glyph.foregroundColor}}boxes%c{}.`,
            // `Move with numpad, search %c{${Tile.box.glyph.foregroundColor}}box%c{} with 'spacebar' or 'return'.`,
            // `Watch out for %c{${this.pedroColor}}Pedro%c{}!`
        ];

        for (let index = helpMessage.length - 1; index >= 0; --index) {
            this.messageLog.appendText(helpMessage[index]);
        }
    }

    private getActorName(actor: Actor): string {
        switch (actor.type) {
            case ActorType.Player:
                return `Player`;
            case ActorType.Pedro:
                return `%c{${actor.glyph.foregroundColor}}Pedro%c{}`;
            case ActorType.TinyPedro:
                return `%c{${actor.glyph.foregroundColor}}Pedros son%c{}`;
            default:
                return "unknown actor";
        }
    }

    private generateBoxes(): void {
        let positions = this.map.getRandomTilePositions(TileType.Floor, this.maximumBoxes);
        for (let position of positions) {
            this.map.setTile(position.x, position.y, Tile.box);
        }
        this.pineapplePoint = positions[0];
    }

    private createBeings(): void {
        // let numberOfEnemies = 1 + Math.floor(this.statusLine.pineapples / 3.0);
        this.enemies = [];
        this.actors = [];
        // let positions = this.map.getRandomTilePositions(TileType.Floor, 1 + numberOfEnemies);
        this.player = new Player(this, new Point(1, Math.floor(this.gridSize.height/2)));
        
        // this.player = new Player(this, positions.splice(0, 1)[0]);
        // for (let position of positions) {
        //     if (this.statusLine.pineapples < 1 || RNG.getUniform() < 0.5) {
        //         this.enemies.push(new Pedro(this, position));
        //     } else {
        //         this.enemies.push(new TinyPedro(this, position));
        //     }
        // }
    }

    private resetStatusLine(): void {
        this.statusLine.reset();
        // this.statusLine.maxBoxes = this.maximumBoxes;
    }

    shoot(x: number, y: number, team: Team) {
        let bullet = new Bullet(this, new Point(x-1,y), team);
        bullet.glyph = new Glyph("-", "#fff");
        this.addActor(bullet);
    }        

    addActor(actor:Actor) {
        this.actors.push(actor);
        this.scheduler.add(actor, true);
    }

    removeActor(actor: Actor) {
        let index = this.actors.indexOf(actor);
        if (index >= 0)
            this.actors.splice(index, 1);
        this.scheduler.remove(actor);
    }

    getActorsAtPosition(position: Point) {
        let actorsThere = []
        this.actors.forEach(actor => {
            if(actor && actor.position.equals(position))
                actorsThere.push(actor);
        });
        return actorsThere;
    }

}