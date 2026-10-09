const DIRECTIONS = {
    up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};
export function same(a, b) { return a.x === b.x && a.y === b.y; }
export function tile(level, point) {
    return level.map[point.y]?.[point.x] ?? '#';
}
export function locate(level, symbol) {
    for (let y = 0; y < level.map.length; y++) {
        const x = level.map[y].indexOf(symbol);
        if (x >= 0)
            return { x, y };
    }
    throw new Error(`Missing tile ${symbol} in ${level.id}`);
}
export function newSession(level) {
    const start = locate(level, 'S');
    return { level, start, player: start, facing: 'down', tick: 0, frames: [], echoes: [], complete: false, lastBlocked: false };
}
/** Echoes hold their final recorded position once their playback finishes. */
export function echoPosition(echo, tick, start) {
    if (tick <= 0 || echo.frames.length === 0)
        return start;
    return echo.frames[Math.min(tick - 1, echo.frames.length - 1)];
}
export function plateSignals(state, atTick = state.tick) {
    const occupants = [state.player, ...state.echoes.map(e => echoPosition(e, atTick, state.start))];
    const pressed = new Set();
    for (const point of occupants) {
        const t = tile(state.level, point);
        if (/^[a-z]$/.test(t))
            pressed.add(t);
    }
    return pressed;
}
export function gatesOpen(state, atTick = state.tick) {
    const pressed = plateSignals(state, atTick);
    const open = new Set();
    for (const [gate, requirements] of Object.entries(state.level.gates)) {
        if (requirements.every(plate => pressed.has(plate)))
            open.add(gate);
    }
    return open;
}
/** Rewind is a pure operation: an immutable frame track becomes the next echo. */
export function rewind(state) {
    if (state.complete || state.frames.length === 0 || state.echoes.length >= state.level.maxEchoes)
        return state;
    const echo = { id: state.echoes.length + 1, frames: state.frames.map(frame => ({ ...frame })) };
    return {
        ...state, player: state.start, facing: 'down', tick: 0,
        echoes: [...state.echoes, echo], frames: [], lastBlocked: false,
    };
}
/** Retry the current timeline without throwing away recordings. */
export function retry(state) {
    if (state.complete)
        return state;
    return { ...state, player: state.start, facing: 'down', tick: 0, frames: [], lastBlocked: false };
}
export function restart(state) { return newSession(state.level); }
/** Undo the last action by replaying remaining actions from a clean loop. */
export function undo(state) {
    if (state.complete || state.frames.length === 0)
        return state;
    let next = retry(state);
    for (const frame of state.frames.slice(0, -1))
        next = advance(next, frame.action).state;
    return next;
}
/**
 * Deterministic turn order:
 * 1. recorded ghosts advance to their next stored frame (intangible by design);
 * 2. switches are evaluated with ghost positions and the current player's tile;
 * 3. the active player attempts one move through the newly evaluated circuit;
 * 4. the resolved position, not merely the key pressed, is recorded.
 * This avoids playback divergence caused by changing gate states in future loops.
 */
export function advance(state, action) {
    if (state.complete || state.tick >= state.level.maxTicks)
        return { state, event: 'limit' };
    const nextTick = state.tick + 1;
    const enabledGates = gatesOpen(state, nextTick);
    let player = state.player;
    let blocked = false;
    let facing = state.facing;
    if (action !== 'wait') {
        facing = action;
        const delta = DIRECTIONS[action];
        const target = { x: player.x + delta.x, y: player.y + delta.y };
        const targetTile = tile(state.level, target);
        if (targetTile === '#' || (targetTile in state.level.gates && !enabledGates.has(targetTile))) {
            blocked = true;
        }
        else {
            player = target;
        }
    }
    const complete = tile(state.level, player) === 'X';
    const frame = { ...player, action, facing, blocked };
    const next = { ...state, player, facing, tick: nextTick, frames: [...state.frames, frame], complete, lastBlocked: blocked };
    return { state: next, event: complete ? 'finish' : blocked ? 'block' : 'move' };
}
export function availableRewinds(state) {
    return Math.max(0, state.level.maxEchoes - state.echoes.length);
}
export function currentLoopEnded(state) {
    return !state.complete && state.tick >= state.level.maxTicks;
}
/** A stable JSON format for replays, independent of the renderer. */
export function exportReplay(state) {
    return JSON.stringify({ format: 'echo-shift/replay-v1', level: state.level.id,
        echoes: state.echoes.map(echo => echo.frames.map(frame => frame.action)),
        current: state.frames.map(frame => frame.action), complete: state.complete }, null, 2);
}
export function importReplay(level, json) {
    const data = JSON.parse(json);
    if (!data || typeof data !== 'object')
        throw new Error('Replay must be an object');
    const record = data;
    if (record.format !== 'echo-shift/replay-v1' || record.level !== level.id)
        throw new Error('Replay format or chamber mismatch');
    if (!Array.isArray(record.echoes) || !Array.isArray(record.current))
        throw new Error('Invalid action tracks');
    if (record.echoes.length > level.maxEchoes)
        throw new Error('Too many echoes');
    const actions = new Set(['up', 'down', 'left', 'right', 'wait']);
    const tracks = [...record.echoes, record.current];
    for (const track of tracks) {
        if (!Array.isArray(track) || track.length > level.maxTicks || !track.every(a => actions.has(a)))
            throw new Error('Invalid actions');
    }
    let state = newSession(level);
    for (const track of record.echoes) {
        if (!track.length)
            throw new Error('Empty echo track');
        for (const action of track)
            state = advance(state, action).state;
        if (state.complete)
            throw new Error('Replay completed before rewinding');
        state = rewind(state);
    }
    for (const action of record.current)
        state = advance(state, action).state;
    return state;
}
//# sourceMappingURL=engine.js.map