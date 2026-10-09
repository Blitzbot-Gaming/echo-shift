export interface Score {
    moves: number;
    echoes: number;
}
export interface Progress {
    unlocked: number;
    wins: Record<string, Score>;
    sound: boolean;
    reducedMotion: boolean;
}
export declare function loadProgress(): Progress;
export declare function saveProgress(p: Progress): void;
export declare function clearProgress(): Progress;
export declare function recordWin(p: Progress, index: number, id: string, score: Score): Progress;
