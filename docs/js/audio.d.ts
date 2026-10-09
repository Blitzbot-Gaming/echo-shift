export type Sound = 'step' | 'blocked' | 'rewind' | 'win' | 'select' | 'switch';
export declare class Soundscape {
    private context;
    enabled: boolean;
    play(name: Sound): void;
}
