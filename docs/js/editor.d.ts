import { type Level } from './levels.js';
/** Editor data stays independent from the game's built-in campaign and save progression. */
export interface Draft {
    name: string;
    map: string[];
    maxTicks: number;
    maxEchoes: number;
    circuits: {
        A: string;
        B: string;
        C: string;
    };
}
export declare const EDITOR_FORMAT = "echo-shift/level-v1";
export declare const EDITOR_TILES: readonly ["#", ".", "S", "X", "a", "b", "c", "A", "B", "C", "0", "1"];
export type EditorTile = typeof EDITOR_TILES[number];
export declare function newDraft(): Draft;
export declare function paintTile(draft: Draft, x: number, y: number, tile: EditorTile): Draft;
export declare function draftToLevel(draft: Draft): Level;
export declare function validateDraft(draft: Draft): string[];
export declare function exportLevel(draft: Draft): string;
/** Parse a shared level without accepting arbitrary properties, long strings or huge grids. */
export declare function importLevel(json: string): Draft;
