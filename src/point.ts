export class Point {
    constructor(public x: number, public y: number) { }

    equals(point: Point): boolean {
        return this.x == point.x && this.y == point.y;
    }

    toKey(): string {
        return this.x + "," + this.y;
    }

    toString(): string {
        return this.toKey();
    }

    clone() {
        return new Point(this.x,this.y);
    }
}