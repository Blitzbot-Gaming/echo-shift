import { validateLevel } from './levels.js';
export const EDITOR_FORMAT = 'echo-shift/level-v1';
export const EDITOR_TILES = ['#', '.', 'S', 'X', 'a', 'b', 'c', 'A', 'B', 'C', '0', '1'];
export function newDraft() {
    return {
        name: 'Untitled Experiment',
        map: [
            '#############',
            '#S....#.....#',
            '#.....#.....#',
            '#..a..#.....#',
            '#.....A...X.#',
            '#.....#.....#',
            '#.....#.....#',
            '#.....#.....#',
            '#############',
        ],
        maxTicks: 20,
        maxEchoes: 1,
        circuits: { A: 'a', B: 'b', C: 'a,b' },
    };
}
export function paintTile(draft, x, y, tile) {
    if (!EDITOR_TILES.includes(tile) || !Number.isInteger(x) || !Number.isInteger(y) ||
        y < 0 || y >= draft.map.length || x < 0 || x >= draft.map[0].length)
        return draft;
    if (draft.map[y][x] === tile)
        return draft;
    const map = draft.map.map(row => row.split(''));
    if (tile === 'S' || tile === 'X') {
        for (const row of map)
            for (let i = 0; i < row.length; i++)
                if (row[i] === tile)
                    row[i] = '.';
    }
    map[y][x] = tile;
    return { ...draft, map: map.map(row => row.join('')) };
}
export function draftToLevel(draft) {
    const gates = {};
    const map = draft.map.join('');
    for (const gate of ['A', 'B', 'C']) {
        if (map.includes(gate))
            gates[gate] = draft.circuits[gate].split(/[\s,]+/).filter(Boolean);
    }
    return {
        id: 'LAB', chapter: 'ANOMALY LAB · CUSTOM EXPERIMENT', name: draft.name.slice(0, 35).trim() || 'Untitled Experiment',
        subtitle: 'Community-designed experiment.', briefing: 'A chamber you designed. Test the timeline.',
        hint: 'Use rewind to leave echoes on switches. Paired digits are two-way portals.',
        map: [...draft.map], maxTicks: draft.maxTicks, maxEchoes: draft.maxEchoes, gates, accent: '#c49cff',
    };
}
export function validateDraft(draft) {
    const level = draftToLevel(draft);
    const errors = validateLevel(level);
    if (!/^[\w ,.'!?:-]{1,35}$/.test(draft.name.trim()))
        errors.push('Name must be 1–35 basic characters');
    if (level.map.length < 5 || (level.map[0]?.length ?? 0) < 7)
        errors.push('Map is too small');
    if (level.map.some(row => /[^#.SXabcABC01]/.test(row)))
        errors.push('Unsupported editor tile');
    for (const [gate, plates] of Object.entries(level.gates)) {
        if (plates.some(plate => !/^[abc]$/.test(plate)))
            errors.push(`Gate ${gate} requires switch names a, b or c`);
    }
    return [...new Set(errors)];
}
export function exportLevel(draft) {
    return JSON.stringify({ format: EDITOR_FORMAT, ...draft }, null, 2);
}
/** Parse a shared level without accepting arbitrary properties, long strings or huge grids. */
export function importLevel(json) {
    if (json.length > 15000)
        throw new Error('Level file exceeds 15 KB');
    const raw = JSON.parse(json);
    if (!raw || typeof raw !== 'object')
        throw new Error('Invalid level file');
    const data = raw;
    if (data.format !== EDITOR_FORMAT || typeof data.name !== 'string' || data.name.length > 35 ||
        !Array.isArray(data.map) || data.map.length !== 9 ||
        !data.map.every(row => typeof row === 'string' && row.length === 13) ||
        !Number.isInteger(data.maxTicks) || !Number.isInteger(data.maxEchoes) ||
        !data.circuits || typeof data.circuits !== 'object')
        throw new Error('Invalid level structure');
    const gateData = data.circuits;
    const circuits = {};
    for (const gate of ['A', 'B', 'C']) {
        const value = gateData[gate];
        if (typeof value !== 'string' || value.length > 20)
            throw new Error(`Invalid gate ${gate}`);
        circuits[gate] = value;
    }
    const draft = { name: data.name, map: data.map, maxTicks: data.maxTicks,
        maxEchoes: data.maxEchoes, circuits };
    const errors = validateDraft(draft);
    if (errors.length)
        throw new Error(errors.join(' · '));
    return draft;
}
//# sourceMappingURL=editor.js.map