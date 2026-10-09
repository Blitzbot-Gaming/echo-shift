/** Hand-authored chambers. Uppercase letter gates; lowercase letter switches. */
export interface Level {
    id: string;
    chapter: string;
    name: string;
    subtitle: string;
    briefing: string;
    hint: string;
    map: readonly string[];
    maxTicks: number;
    maxEchoes: number;
    gates: Readonly<Record<string, readonly string[]>>;
    accent: string;
}
export declare const LEVELS: readonly Level[];
export declare function getLevel(id: string): Level;
/** Fails fast on accidental typos, unreachable content and invalid circuit wiring. */
export declare function validateLevel(level: Level): string[];
