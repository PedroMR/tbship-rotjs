import { Glyph } from "./glyph";

export const enum TileType {
    Floor,
    Box,
    SearchedBox,
    DestroyedBox,
    Star,
}

export class Tile {
    static readonly floor = new Tile(TileType.Floor, new Glyph("", "#555"));
    static readonly box = new Tile(TileType.Box, new Glyph("#", "#654321"));
    static readonly searchedBox = new Tile(TileType.SearchedBox, new Glyph("#", "#666"));
    static readonly destroyedBox = new Tile(TileType.DestroyedBox, new Glyph("x", "#555"));
    static readonly farStar = new Tile(TileType.Star, new Glyph("·", "#666"));
    static readonly midStar = new Tile(TileType.Star, new Glyph("·", "#999"));
    static readonly nearStar = new Tile(TileType.Star, new Glyph("·", "#aaa"));

    constructor(public readonly type: TileType, public readonly glyph: Glyph) { }
}