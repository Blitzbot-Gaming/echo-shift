import type { Level } from './levels.js';
export type Action = 'up' | 'down' | 'left' | 'right' | 'wait';
export type Facing = 'up' | 'down' | 'left' | 'right';
export interface Position {
    readonly x: number;
    readonly y: number;
}
export interface Frame extends Position {
    readonly action: Action;
    readonly facing: Facing;
    readonly blocked: boolean;
}
export interface Echo {
    readonly id: number;
    readonly frames: readonly Frame[];
}
export interface Session {
    readonly level: Level;
    readonly start: Position;
    readonly player: Position;
    readonly facing: Facing;
    readonly tick: number;
    readonly frames: readonly Frame[];
    readonly echoes: readonly Echo[];
    readonly complete: boolean;
    readonly lastBlocked: boolean;
}
export interface StepResult {
    readonly state: Session;
    readonly event: 'move' | 'block' | 'finish' | 'limit';
}
export declare function same(a: Position, b: Position): boolean;
export declare function tile(level: Level, point: Position): string;
export declare function locate(level: Level, symbol: string): Position;
export declare function newSession(level: Level): Session;
/** Echoes hold their final recorded position once their playback finishes. */
export declare function echoPosition(echo: Echo, tick: number, start: Position): Position;
export declare function plateSignals(state: Session, atTick?: number): ReadonlySet<string>;
export declare function gatesOpen(state: Session, atTick?: number): ReadonlySet<string>;
/** Rewind is a pure operation: an immutable frame track becomes the next echo. */
export declare function rewind(state: Session): Session;
/** Retry the current timeline without throwing away recordings. */
export declare function retry(state: Session): Session;
export declare function restart(state: Session): Session;
/** Undo the last action by replaying remaining actions from a clean loop. */
export declare function undo(state: Session): Session;
/**
 * Deterministic turn order:
 * 1. recorded ghosts advance to their next stored frame (intangible by design);
 * 2. switches are evaluated with ghost positions and the current player's tile;
 * 3. the active player attempts one move through the newly evaluated circuit;
 * 4. the resolved position, not merely the key pressed, is recorded.
 * This avoids playback divergence caused by changing gate states in future loops.
 */
export declare function advance(state: Session, action: Action): StepResult;
export declare function availableRewinds(state: Session): number;
export declare function currentLoopEnded(state: Session): boolean;
/** A stable JSON format for replays, independent of the renderer. */
export declare function exportReplay(state: Session): string;
export interface ReplayData {
    format: 'echo-shift/replay-v1';
    level: string;
    echoes: Action[][];
    current: Action[];
}
export declare function importReplay(level: Level, json: string): Session;
