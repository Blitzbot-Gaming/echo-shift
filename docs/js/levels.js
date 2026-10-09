export const LEVELS = [
    {
        id: '01', chapter: 'ACT I · THE ARRIVAL', name: 'First Light', subtitle: 'Learn to move.',
        briefing: 'You wake inside an abandoned observation facility. Find the extraction portal.',
        hint: 'Reach the green extraction portal. Arrow keys or WASD move you one tile.',
        map: [
            '#############',
            '#S..........#',
            '#..####.....#',
            '#......#....#',
            '#......#..X.#',
            '#..##.......#',
            '#.......##..#',
            '#...........#',
            '#############',
        ],
        maxTicks: 25, maxEchoes: 0, gates: {}, accent: '#78f5be',
    },
    {
        id: '02', chapter: 'ACT I · THE ARRIVAL', name: 'Afterimage', subtitle: 'Meet yourself.',
        briefing: 'The gate responds to a pressure plate. Leave an echo on the switch, then cross.',
        hint: 'Stand on the blue plate, press R to record an echo. Your echo holds its last position.',
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
        maxTicks: 19, maxEchoes: 1, gates: { A: ['a'] }, accent: '#7dd8ff',
    },
    {
        id: '03', chapter: 'ACT I · THE ARRIVAL', name: 'The Long Way', subtitle: 'Every step counts.',
        briefing: 'Not every switch lies along the shortest route. Record your detour first.',
        hint: 'The switch is in the lower-left chamber. Echoes keep holding their final tiles.',
        map: [
            '#############',
            '#S......#...#',
            '#...##..A.X.#',
            '#...#...#...#',
            '#...#...#...#',
            '#.......#...#',
            '#.a.....#...#',
            '#.......#...#',
            '#############',
        ],
        maxTicks: 24, maxEchoes: 1, gates: { A: ['a'] }, accent: '#7dd8ff',
    },
    {
        id: '04', chapter: 'ACT II · THE FRACTURE', name: 'Split Signal', subtitle: 'One is not enough.',
        briefing: 'Two separated plates control one seal. Leave two different echoes behind.',
        hint: 'First record one plate. On the next loop, record the other. Then escape.',
        map: [
            '#############',
            '#S....#.....#',
            '#..a..#.....#',
            '#.....#.....#',
            '#.....C...X.#',
            '#.....#.....#',
            '#..b..#.....#',
            '#.....#.....#',
            '#############',
        ],
        maxTicks: 19, maxEchoes: 2, gates: { C: ['a', 'b'] }, accent: '#c4a1ff',
    },
    {
        id: '05', chapter: 'ACT II · THE FRACTURE', name: 'Signal Drift', subtitle: 'Find another way.',
        briefing: 'The maintenance corridors wind around a locked chamber. Your first run is a setup.',
        hint: 'Reach the plate near the northern edge before recording your next loop.',
        map: [
            '#############',
            '#S...a.#....#',
            '#..##..#....#',
            '#......#....#',
            '#..##..#....#',
            '#......#....#',
            '#......A..X.#',
            '#......#....#',
            '#############',
        ],
        maxTicks: 23, maxEchoes: 1, gates: { A: ['a'] }, accent: '#7dd8ff',
    },
    {
        id: '06', chapter: 'ACT II · THE FRACTURE', name: 'Relay Station', subtitle: 'Build on your past.',
        briefing: 'The second switch is beyond the first gate. Your echoes must work in sequence.',
        hint: 'Echo 01 holds a. Echo 02 travels through the opened first gate to hold b.',
        map: [
            '###############',
            '#S..#...#.....#',
            '#...#...#.....#',
            '#.a.A...B...X.#',
            '#...#...#.....#',
            '#...#b..#.....#',
            '#...#...#.....#',
            '#...#...#.....#',
            '###############',
        ],
        maxTicks: 22, maxEchoes: 2, gates: { A: ['a'], B: ['b'] }, accent: '#c4a1ff',
    },
    {
        id: '07', chapter: 'ACT III · THE COLLAPSE', name: 'Crossing Point', subtitle: 'Align the timelines.',
        briefing: 'Two scattered signals unlock a seal running across the floor.',
        hint: 'Both switches are north of the barrier. Once both echoes hold, cross south.',
        map: [
            '#############',
            '#S..........#',
            '#..##..##a..#',
            '#..b........#',
            '#######C#####',
            '#...........#',
            '#.....##....#',
            '#..........X#',
            '#############',
        ],
        maxTicks: 24, maxEchoes: 2, gates: { C: ['a', 'b'] }, accent: '#ffa98e',
    },
    {
        id: '08', chapter: 'ACT III · THE COLLAPSE', name: 'Broken Circuit', subtitle: 'Navigate the noise.',
        briefing: 'A maze of failed relays. Plan each echo before you spend the final loop.',
        hint: 'The two pressure plates are hidden in separate branches left of the door.',
        map: [
            '###############',
            '#S......#.....#',
            '#.#.###.#.....#',
            '#.#a....#.....#',
            '#....##.C..X..#',
            '#.#b....#.....#',
            '#.#.###.#.....#',
            '#.......#.....#',
            '###############',
        ],
        maxTicks: 23, maxEchoes: 2, gates: { C: ['a', 'b'] }, accent: '#ffa98e',
    },
    {
        id: '09', chapter: 'ACT III · THE COLLAPSE', name: 'The Paradox', subtitle: 'One final iteration.',
        briefing: 'Three signals. Three echoes. One way out. The experiment ends here.',
        hint: 'Create a separate echo for each of the three plates. Save the final run for extraction.',
        map: [
            '###############',
            '#S......#.....#',
            '#..a....#.....#',
            '#.......#.....#',
            '#.......C...X.#',
            '#.......#.....#',
            '#..b.c..#.....#',
            '#.......#.....#',
            '###############',
        ],
        maxTicks: 23, maxEchoes: 3, gates: { C: ['a', 'b', 'c'] }, accent: '#ffc277',
    },
    {
        id: '10', chapter: 'ACT IV · THE RIFT', name: 'Folded Space', subtitle: 'Distance is an illusion.',
        briefing: 'Paired rift portals fold the chamber in two. Step into either matching digit to emerge at the other.',
        hint: 'The violet rift connects the two halves of the map. Enter the portal marked 0.',
        map: [
            '#############',
            '#S....#.....#',
            '#.....#.....#',
            '#..0..#..0..#',
            '#.....#...X.#',
            '#.....#.....#',
            '#.....#.....#',
            '#.....#.....#',
            '#############',
        ],
        maxTicks: 15, maxEchoes: 0, gates: {}, accent: '#c49cff',
    },
    {
        id: '11', chapter: 'ACT IV · THE RIFT', name: 'Pocket Dimension', subtitle: 'Leave a signal behind.',
        briefing: 'A rift reaches an isolated switch. Record your echo there, then return to cross the sealed gate.',
        hint: 'Take portal 0 to reach switch a. Record the echo, take the portal again and cross gate A.',
        map: [
            '###############',
            '#S.....#......#',
            '#....0.#......#',
            '#.....##......#',
            '#.....#a#.....#',
            '#.....#0A..X..#',
            '#.....###.....#',
            '#......#......#',
            '###############',
        ],
        maxTicks: 18, maxEchoes: 1, gates: { A: ['a'] }, accent: '#a9c5ff',
    },
    {
        id: '12', chapter: 'ACT IV · THE RIFT', name: 'Dual Entanglement', subtitle: 'Two rifts. One exit.',
        briefing: 'Two pocket dimensions hide the only switches that can open the last circuit.',
        hint: 'First take portal 0 to hold a. Next take portal 1 to hold b. On the final loop enter 0, wait until both echoes activate their switches, then cross C.',
        map: [
            '###############',
            '#S.....#......#',
            '#..0...#......#',
            '#.....#a#.....#',
            '#.....#0#.....#',
            '#.....#.C..X..#',
            '#..1..#1#.....#',
            '#.....#b#.....#',
            '###############',
        ],
        maxTicks: 21, maxEchoes: 2, gates: { C: ['a', 'b'] }, accent: '#d19afa',
    },
];
export function getLevel(id) {
    const level = LEVELS.find(level => level.id === id);
    if (!level)
        throw new Error(`Unknown chamber: ${id}`);
    return level;
}
/** Fails fast on accidental typos, unreachable content and invalid circuit wiring. */
export function validateLevel(level) {
    const errors = [];
    const height = level.map.length;
    const width = level.map[0]?.length ?? 0;
    if (!height || !width)
        errors.push('Map may not be empty');
    if (level.map.some(row => row.length !== width))
        errors.push('Rows must have equal widths');
    const flat = level.map.join('');
    if ((flat.match(/S/g) ?? []).length !== 1)
        errors.push('Exactly one start required');
    if ((flat.match(/X/g) ?? []).length !== 1)
        errors.push('Exactly one exit required');
    if (level.maxTicks < 1 || level.maxEchoes < 0)
        errors.push('Invalid timeline limits');
    if (!Number.isInteger(level.maxTicks) || level.maxTicks > 60 || !Number.isInteger(level.maxEchoes) || level.maxEchoes > 3)
        errors.push('Timeline limits exceed supported range');
    if (width > 21 || height > 15)
        errors.push('Map must be no larger than 21×15');
    for (const symbol of flat) {
        if ('#.SX'.includes(symbol) || /^[a-z0-9]$/.test(symbol))
            continue;
        if (/^[A-Z]$/.test(symbol) && level.gates[symbol])
            continue;
        errors.push(`Unknown map symbol ${symbol}`);
    }
    for (const digit of new Set(flat.match(/[0-9]/g) ?? [])) {
        if (flat.split(digit).length !== 3)
            errors.push(`Portal ${digit} requires exactly two endpoints`);
    }
    for (const [door, plates] of Object.entries(level.gates)) {
        if (!flat.includes(door))
            errors.push(`Unused door configuration ${door}`);
        if (!plates.length)
            errors.push(`Door ${door} has no activators`);
        for (const plate of plates)
            if (!flat.includes(plate))
                errors.push(`Missing plate ${plate}`);
    }
    return errors;
}
//# sourceMappingURL=levels.js.map