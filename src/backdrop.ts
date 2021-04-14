import { Tile, TileType } from "./tile";
import { RNG } from "rot-js";
import { Point } from "./point";
import { Game } from "./game";

class Star {
    public position: Point;
    public z: number;
    public stepsLeft: number;
}

export class Backdrop {
    private map: { [key: string]: Tile };        
    private stars: Star[];
    private width: number;
    private height: number;

    constructor(private game: Game) {
        this.map = {};
        this.stars = [];
    }

    generate(width: number, height: number): void {
        this.map = {};
        this.stars = [];
        this.height = height;
        this.width = width;

        for(var i:number = 0; i < 40; i++)
        {
            let s = new Star();
            s.position = new Point(RNG.getUniformInt(0, width-1), RNG.getUniformInt(0, height-1));
            s.z = RNG.getUniformInt(0, 2);
            s.stepsLeft = this.stepsForStarZ(s.z);
            this.stars.push(s);
        }

    }    

    step(): void {
        this.stars.forEach(star => {            
            // console.log(`star z=${star.z} stepsLeft=${star.stepsLeft}`)
            if (--star.stepsLeft <= 0)
            {
                star.stepsLeft = this.stepsForStarZ(star.z);
                if (--star.position.x < 0)
                {
                    star.position.x = this.width-1;
                    star.position.y = RNG.getUniformInt(0, this.height-1);
                }
            }
        });
    }

    private stepsForStarZ(z:number) : number {
        return 2**(z+1);
    }

    draw(): void {
        // console.log("stars: "+this.stars.length);
        this.stars.forEach(star => {
            let glyph = Tile.nearStar.glyph;
            switch(star.z)
            {
                case 1:
                    glyph = Tile.midStar.glyph;
                    break;
                case 2:
                    glyph = Tile.farStar.glyph;
                    break;
            }
            this.game.draw(star.position, glyph)
            // console.log(star.position.toKey()+" -> "+star.z);
        });
    }

    private coordinatesToKey(x: number, y: number): string {
        return x + "," + y;
    }

    private keyToPoint(key: string): Point {
        let parts = key.split(",");
        return new Point(parseInt(parts[0]), parseInt(parts[1]));
    }
    
}
