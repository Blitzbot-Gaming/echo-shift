import type { Level } from './levels.js';
export declare class LevelLab {
    private draft;
    private brush;
    private listeners;
    private save;
    private render;
    mount(root: HTMLElement, onPlay: (level: Level) => void, notify: (message: string) => void): void;
}
