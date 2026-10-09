import { type Session } from './engine.js';
export declare class GameRenderer {
    private ctx;
    private canvas;
    private current;
    private reduceMotion;
    private raf;
    private animationStart;
    private inspectedTick;
    private stars;
    constructor(canvas: HTMLCanvasElement, current: () => Session, reduceMotion: () => boolean);
    private resize;
    setInspectTick(tick: number | null): void;
    destroy(): void;
    private frame;
    private draw;
    private actor;
}
