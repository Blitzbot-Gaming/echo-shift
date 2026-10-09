const KEY = 'echoshift.save.v1';
const DEFAULT = { unlocked: 1, wins: {}, sound: true, reducedMotion: false };
export function loadProgress() {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw)
            return { ...DEFAULT, wins: {} };
        const stored = JSON.parse(raw);
        if (!stored || typeof stored !== 'object')
            return { ...DEFAULT, wins: {} };
        const p = stored;
        return {
            unlocked: typeof p.unlocked === 'number' && Number.isFinite(p.unlocked) ? Math.max(1, Math.min(12, Math.floor(p.unlocked))) : 1,
            wins: p.wins && typeof p.wins === 'object' ? p.wins : {},
            sound: typeof p.sound === 'boolean' ? p.sound : true,
            reducedMotion: typeof p.reducedMotion === 'boolean' ? p.reducedMotion : false,
        };
    }
    catch {
        return { ...DEFAULT, wins: {} };
    }
}
export function saveProgress(p) {
    try {
        localStorage.setItem(KEY, JSON.stringify(p));
    }
    catch { /* private browsing or unavailable storage */ }
}
export function clearProgress() {
    const p = { ...DEFAULT, wins: {} };
    saveProgress(p);
    return p;
}
export function recordWin(p, index, id, score) {
    const old = p.wins[id];
    const better = !old || score.echoes < old.echoes || (score.echoes === old.echoes && score.moves < old.moves);
    const next = { ...p, unlocked: Math.max(p.unlocked, Math.min(12, index + 2)), wins: { ...p.wins, [id]: better ? score : old } };
    saveProgress(next);
    return next;
}
//# sourceMappingURL=storage.js.map