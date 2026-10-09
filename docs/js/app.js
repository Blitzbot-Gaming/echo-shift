import { LEVELS } from './levels.js';
import { advance, availableRewinds, currentLoopEnded, exportReplay, gatesOpen, importReplay, newSession, restart, retry, rewind, undo } from './engine.js';
import { clearProgress, loadProgress, recordWin, saveProgress } from './storage.js';
import { Soundscape } from './audio.js';
import { GameRenderer } from './renderer.js';
const $ = (selector) => {
    const element = document.querySelector(selector);
    if (!element)
        throw new Error(`Missing UI element ${selector}`);
    return element;
};
let progress = loadProgress();
let state = newSession(LEVELS[0]);
let inspectedTick = null;
let hintVisible = false;
let toastTimer = 0;
let modalType = null;
const sound = new Soundscape();
sound.enabled = progress.sound;
const renderer = new GameRenderer($('#gameCanvas'), () => state, () => progress.reducedMotion);
const icons = { up: '↑', down: '↓', left: '←', right: '→', wait: '·' };
function notify(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.classList.remove('visible'), 2600);
}
function setInspection(tick) {
    inspectedTick = tick;
    renderer.setInspectTick(tick);
    renderHud();
}
function changeLevel(index) {
    if (index < 0 || index >= LEVELS.length || index >= progress.unlocked) {
        notify('Chamber locked. Clear the previous chamber first.');
        return;
    }
    state = newSession(LEVELS[index]);
    inspectedTick = null;
    renderer.setInspectTick(null);
    hintVisible = false;
    closeModal();
    renderHud();
    sound.play('select');
    notify(`CHAMBER ${state.level.id} · ${state.level.name.toUpperCase()}`);
}
function totalMoves(s) {
    return s.frames.length + s.echoes.reduce((count, echo) => count + echo.frames.length, 0);
}
function input(action) {
    if (modalType)
        return;
    if (state.complete)
        return;
    if (inspectedTick !== null)
        setInspection(null);
    const result = advance(state, action);
    if (result.event === 'limit') {
        notify(availableRewinds(state) ? 'Timeline exhausted. Press R to record your echo.' : 'Timeline exhausted. Press X to retry this loop.');
        sound.play('blocked');
        return;
    }
    state = result.state;
    if (result.event === 'block')
        sound.play('blocked');
    else
        sound.play('step');
    if (result.event === 'finish') {
        sound.play('win');
        const index = LEVELS.indexOf(state.level);
        progress = recordWin(progress, index, state.level.id, { moves: totalMoves(state), echoes: state.echoes.length });
        renderHud();
        window.setTimeout(() => openModal('win'), 500);
        return;
    }
    renderHud();
    if (currentLoopEnded(state))
        notify(availableRewinds(state) ? 'Time is up! Rewind to create your next echo.' : 'No more echoes available. Retry this timeline.');
}
function performRewind() {
    if (modalType)
        return;
    setInspection(null);
    if (state.complete)
        return;
    if (state.frames.length === 0) {
        notify('Record at least one move first.');
        return;
    }
    if (availableRewinds(state) === 0) {
        notify('Echo slots full. Press X to retry or restart the chamber.');
        sound.play('blocked');
        return;
    }
    state = rewind(state);
    sound.play('rewind');
    renderHud();
    notify(`ECHO ${String(state.echoes.length).padStart(2, '0')} RECORDED · TIMELINE RESET`);
}
function performUndo() {
    if (modalType)
        return;
    setInspection(null);
    if (state.frames.length === 0)
        return;
    state = undo(state);
    sound.play('select');
    renderHud();
}
function performRetry() {
    if (modalType)
        return;
    if (state.complete)
        return;
    setInspection(null);
    state = retry(state);
    renderHud();
    sound.play('rewind');
    notify('Current timeline reset. Recorded echoes retained.');
}
function performRestart() {
    setInspection(null);
    state = restart(state);
    closeModal();
    renderHud();
    sound.play('rewind');
    notify('All timelines erased. Start again.');
}
function renderTracks() {
    const root = $('#timeline');
    const max = state.level.maxTicks;
    const tracks = [
        ...state.echoes.map((echo, i) => ({ label: `ECHO ${String(i + 1).padStart(2, '0')}`, frames: echo.frames, type: `echo-${i % 3}`, id: String(i + 1) })),
        { label: 'YOU / LIVE', frames: state.frames, type: 'live', id: '▶' },
    ];
    root.innerHTML = tracks.map(track => `<div class="timeline-row">
    <div class="track-label"><span class="track-dot ${track.type}"></span>${track.label}<span class="track-length">${track.frames.length}/${max}</span></div>
    <div class="track-cells" style="--tracks:${max}">${Array.from({ length: max }, (_, i) => {
        const frame = track.frames[i];
        const active = inspectedTick !== null && inspectedTick === i + 1;
        return `<button class="track-cell ${frame ? 'filled' : ''} ${track.type} ${active ? 'selected' : ''}" data-inspect="${i + 1}" ${frame || track.type !== 'live' ? '' : 'disabled'} title="Beat ${i + 1}${frame ? ` · ${frame.action}${frame.blocked ? ' (blocked)' : ''}` : ''}" aria-label="Inspect beat ${i + 1} for ${track.label}">${frame ? (frame.blocked ? '×' : icons[frame.action]) : ''}</button>`;
    }).join('')}</div>
  </div>`).join('');
    $('#inspectorStatus').textContent = inspectedTick === null ? 'LIVE TIMELINE' : `INSPECTING T+${String(inspectedTick).padStart(2, '0')}`;
    $('#resumeInspection').classList.toggle('is-hidden', inspectedTick === null);
}
function renderHud() {
    const index = LEVELS.indexOf(state.level);
    $('#chamberNumber').textContent = state.level.id;
    $('#chamberName').textContent = state.level.name;
    $('#levelLabel').textContent = `CHAMBER ${state.level.id} / 09`;
    $('#actLabel').textContent = state.level.chapter;
    $('#briefing').textContent = state.level.briefing;
    $('#stepsValue').textContent = `${String(state.tick).padStart(2, '0')} / ${String(state.level.maxTicks).padStart(2, '0')}`;
    $('#loopValue').textContent = `${state.echoes.length + 1} / ${state.level.maxEchoes + 1}`;
    $('#movesValue').textContent = `${totalMoves(state)}`;
    $('#rewindsValue').textContent = `${availableRewinds(state)}`;
    $('#progressLabel').textContent = `${Object.keys(progress.wins).length} / ${LEVELS.length} CLEARED`;
    $('#meterFill').style.width = `${state.tick / state.level.maxTicks * 100}%`;
    $('#meterCaption').textContent = `${state.level.maxTicks - state.tick} BEATS REMAINING`;
    $('#goalStatus').textContent = state.complete ? 'EXTRACTION SUCCESSFUL' : currentLoopEnded(state) ? 'TIMELINE EXHAUSTED' : 'EXTRACTION PENDING';
    $('#goalStatus').classList.toggle('is-done', state.complete);
    $('#hintText').textContent = hintVisible ? state.level.hint : 'A little guidance is one click away.';
    $('#hintToggle').textContent = hintVisible ? 'HIDE HINT' : 'REVEAL HINT';
    $('#rewindButton').toggleAttribute('disabled', state.frames.length === 0 || availableRewinds(state) === 0 || state.complete);
    $('#undoButton').toggleAttribute('disabled', state.frames.length === 0 || state.complete);
    $('#retryButton').toggleAttribute('disabled', state.frames.length === 0 || state.complete);
    $('#soundButton').textContent = progress.sound ? 'SOUND ON' : 'SOUND OFF';
    $('#prevLevel').toggleAttribute('disabled', index === 0);
    $('#nextLevel').toggleAttribute('disabled', index + 1 >= progress.unlocked || index + 1 >= LEVELS.length);
    const slots = $('#echoSlots');
    slots.innerHTML = Array.from({ length: state.level.maxEchoes }, (_, i) => {
        const echo = state.echoes[i];
        return `<div class="echo-slot ${echo ? 'populated' : ''}"><div class="echo-icon ${echo ? `echo-${i % 3}` : ''}">${echo ? '◈' : '+'}</div><div><strong>ECHO ${String(i + 1).padStart(2, '0')}</strong><span>${echo ? `${echo.frames.length} recorded beats · active` : 'Awaiting recording'}</span></div>${echo ? '<span class="slot-live">LIVE</span>' : ''}</div>`;
    }).join('') || `<div class="empty-echo">NO ECHO RECORDINGS IN THIS CHAMBER<br><small>Your first move changes everything.</small></div>`;
    const sources = Object.entries(state.level.gates);
    const enabled = gatesOpen(state);
    $('#circuitList').innerHTML = sources.length ? sources.map(([gate, plates]) => `<div class="circuit"><span class="circuit-gate">${gate}</span><span>GATE ${gate}</span><span class="circuit-state ${enabled.has(gate) ? 'open' : ''}">${enabled.has(gate) ? 'ONLINE' : plates.map(p => p.toUpperCase()).join(' + ') + ' REQUIRED'}</span></div>`).join('') : '<div class="circuit-no-gates">NO ACTIVE CIRCUITS · DIRECT EXTRACTION</div>';
    renderTracks();
}
function closeModal() {
    modalType = null;
    const overlay = $('#modal');
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    $('#modalBody').innerHTML = '';
}
function modalShell(eyebrow, title, desc, body, footer = '') {
    return `<div class="modal-head"><span class="eyebrow">${eyebrow}</span><button data-action="close" class="icon-button modal-close" aria-label="Close dialog">✕</button></div><h2>${title}</h2><p class="modal-description">${desc}</p>${body}${footer}`;
}
function openModal(name) {
    modalType = name;
    const overlay = $('#modal');
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    const root = $('#modalBody');
    if (name === 'welcome') {
        root.innerHTML = `<div class="welcome-glow"></div>${modalShell('TRANSMISSION 001 / SYSTEM ONLINE', 'YOU ARE NOT <em>ALONE.</em>', 'Your future depends on the decisions your past self makes. Record a timeline. Leave an echo. Escape the experiment.', `<div class="welcome-features"><span><b>09</b> CHAMBERS</span><span><b>03</b> ACTS</span><span><b>∞</b> POSSIBILITIES</span></div>
      <div class="modal-actions"><button class="button primary huge" data-action="start">ENTER THE EXPERIMENT <span>↗</span></button><button class="button subdued" data-action="help">HOW TO PLAY</button></div>`, `<p class="micro-note">DESIGNED & ENGINEERED WITH ZERO EXTERNAL GAME ASSETS</p>`)}`;
    }
    else if (name === 'help') {
        root.innerHTML = modalShell('OPERATIONS MANUAL / READ CAREFULLY', 'MAKE THE PAST <em>USEFUL.</em>', 'A quick briefing before you alter the timeline.', `<div class="help-grid">
        <div class="help-item"><span class="help-num">01</span><div><h3>MOVE</h3><p>Use <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrow keys to move one tile per beat. Press <kbd>SPACE</kbd> to wait.</p></div></div>
        <div class="help-item"><span class="help-num">02</span><div><h3>RECORD AN ECHO</h3><p>Stand on a switch and press <kbd>R</kbd>. Your entire previous path becomes an echo that replays each beat in the next loop.</p></div></div>
        <div class="help-item"><span class="help-num">03</span><div><h3>COORDINATE</h3><p>Echoes can activate switches and keep holding their last position. Gates only open when all required switches are occupied.</p></div></div>
        <div class="help-item"><span class="help-num">04</span><div><h3>REWRITE YOUR STRATEGY</h3><p>Press <kbd>Z</kbd> to undo, <kbd>X</kbd> to retry the active loop, or use the timeline inspector to study a recorded move.</p></div></div>
      </div><div class="modal-actions"><button class="button primary" data-action="close">UNDERSTOOD <span>→</span></button></div>`);
    }
    else if (name === 'levels') {
        root.innerHTML = modalShell('THE EXPERIMENT / CHAMBER INDEX', 'SELECT A <em>TIMELINE.</em>', 'Complete chambers to unlock more of the experiment.', `<div class="levels-grid">${LEVELS.map((level, i) => `<button class="level-card ${i >= progress.unlocked ? 'locked' : ''} ${state.level.id === level.id ? 'active' : ''}" data-level="${i}" ${i >= progress.unlocked ? 'disabled' : ''}>
        <span class="level-index">${level.id} / 09</span><span class="level-medal">${progress.wins[level.id] ? '◆ CLEARED' : i >= progress.unlocked ? '⌁ LOCKED' : '◉ AVAILABLE'}</span>
        <strong>${level.name}</strong><small>${level.subtitle}</small><span class="level-bottom">${i < progress.unlocked ? `${level.maxEchoes} ECHO SLOTS` : 'UNAVAILABLE'} <span>↗</span></span></button>`).join('')}</div>`);
    }
    else if (name === 'win') {
        const index = LEVELS.indexOf(state.level);
        const final = index === LEVELS.length - 1;
        const score = progress.wins[state.level.id];
        root.innerHTML = `<div class="victory-mark">✧</div>${modalShell('EXTRACTION LOG / CHAMBER CLEARED', final ? 'PARADOX <em>RESOLVED.</em>' : 'TIMELINE <em>STABILIZED.</em>', final ? 'You outsmarted the entire experiment. Every version of you made this moment possible.' : 'A path appeared where there was none. Your past selves did their part.', `<div class="result-grid"><div><strong>${String(totalMoves(state)).padStart(2, '0')}</strong><small>TOTAL BEATS</small></div><div><strong>${state.echoes.length}</strong><small>ECHOES USED</small></div><div><strong>${score ? String(score.moves).padStart(2, '0') : '—'}</strong><small>PERSONAL BEST</small></div></div>
      <div class="modal-actions">${!final ? `<button class="button primary" data-action="next">NEXT CHAMBER <span>↗</span></button>` : `<button class="button primary" data-action="levels">REVISIT CHAMBERS <span>↗</span></button>`}<button class="button subdued" data-action="replay">REPLAY CHAMBER</button><button class="button subdued" data-action="export">SAVE REPLAY</button></div>`)}`;
    }
    else if (name === 'settings') {
        root.innerHTML = modalShell('ENVIRONMENT CONFIGURATION', 'SYSTEM <em>SETTINGS.</em>', 'Adjust the experiment to your preferences.', `<div class="setting-row"><div><strong>SYNTHESIZED SOUND</strong><span>Generated entirely in the browser. No audio files.</span></div><button class="button outlined" data-action="toggle-sound">${progress.sound ? 'ENABLED' : 'DISABLED'}</button></div>
      <div class="setting-row"><div><strong>REDUCED MOTION</strong><span>Turn off pulsing visual effects.</span></div><button class="button outlined" data-action="toggle-motion">${progress.reducedMotion ? 'ENABLED' : 'DISABLED'}</button></div>
      <div class="setting-row danger-setting"><div><strong>ERASE ALL PROGRESS</strong><span>Clear your local completion records and unlocks.</span></div><button class="button outlined danger" data-action="confirm-reset">ERASE DATA</button></div>`);
    }
    else if (name === 'reset') {
        root.innerHTML = modalShell('DANGEROUS OPERATION / IRREVERSIBLE', 'ERASE <em>EVERYTHING?</em>', 'This deletes all unlocked chambers and personal bests stored on this device.', `<div class="modal-actions"><button class="button danger-solid" data-action="clear-save">YES, ERASE ALL</button><button class="button subdued" data-action="settings">CANCEL</button></div>`);
    }
    else if (name === 'import') {
        root.innerHTML = modalShell('PORTABLE TIMELINE / JSON FORMAT', 'IMPORT <em>A REPLAY.</em>', 'Paste a previously exported replay for the currently selected chamber. Imports are validated before loading.', `<label class="import-label" for="replayInput">REPLAY DATA</label><textarea id="replayInput" spellcheck="false" placeholder='{"format":"echo-shift/replay-v1", ...}' rows="8"></textarea><div class="modal-actions"><button class="button primary" data-action="load-replay">LOAD REPLAY <span>↗</span></button></div>`);
    }
    root.querySelector('[data-action="start"], [data-action="close"], [data-action="next"], [data-action="load-replay"]')?.focus();
}
function exportCurrent() {
    const json = exportReplay(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `echo-shift-chamber-${state.level.id}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Replay exported as JSON.');
}
const buttonActions = {
    start: () => closeModal(), close: () => closeModal(), help: () => openModal('help'), levels: () => openModal('levels'),
    settings: () => openModal('settings'), next: () => changeLevel(Math.min(LEVELS.length - 1, LEVELS.indexOf(state.level) + 1)),
    replay: () => { closeModal(); performRestart(); },
    reset: () => openModal('reset'), 'confirm-reset': () => openModal('reset'),
    'clear-save': () => { progress = clearProgress(); state = newSession(LEVELS[0]); closeModal(); renderHud(); notify('Progress erased. Experiment rebooted.'); },
    'toggle-sound': () => { progress = { ...progress, sound: !progress.sound }; saveProgress(progress); sound.enabled = progress.sound; openModal('settings'); renderHud(); },
    'toggle-motion': () => { progress = { ...progress, reducedMotion: !progress.reducedMotion }; saveProgress(progress); openModal('settings'); },
    rewind: () => performRewind(), undo: () => performUndo(), retry: () => performRetry(), restart: () => performRestart(),
    export: () => exportCurrent(), import: () => openModal('import'),
    'load-replay': () => {
        try {
            const data = $('#replayInput').value.trim();
            if (data.length > 50000)
                throw new Error('Replay is too large');
            state = importReplay(state.level, data);
            if (state.complete)
                progress = recordWin(progress, LEVELS.indexOf(state.level), state.level.id, { moves: totalMoves(state), echoes: state.echoes.length });
            closeModal();
            setInspection(null);
            renderHud();
            notify('Replay imported successfully.');
            if (state.complete)
                window.setTimeout(() => openModal('win'), 350);
        }
        catch (error) {
            notify(`INVALID REPLAY · ${error instanceof Error ? error.message : 'Unknown problem'}`);
        }
    },
    'toggle-hint': () => { hintVisible = !hintVisible; renderHud(); },
    'prev-level': () => changeLevel(LEVELS.indexOf(state.level) - 1),
    'next-level': () => changeLevel(LEVELS.indexOf(state.level) + 1),
    'resume-inspection': () => setInspection(null),
    'toggle-audio': () => { progress = { ...progress, sound: !progress.sound }; saveProgress(progress); sound.enabled = progress.sound; renderHud(); },
};
document.addEventListener('click', e => {
    const target = e.target.closest('[data-action], [data-level], [data-move], [data-inspect]');
    if (!target)
        return;
    if (target.dataset.move) {
        input(target.dataset.move);
        return;
    }
    if (target.dataset.inspect) {
        setInspection(Number(target.dataset.inspect));
        sound.play('select');
        return;
    }
    if (target.dataset.level) {
        changeLevel(Number(target.dataset.level));
        return;
    }
    const action = target.dataset.action;
    if (action)
        buttonActions[action]?.();
});
const keys = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'wait',
};
document.addEventListener('keydown', e => {
    const target = e.target;
    if (target.closest('textarea,input,select') || e.ctrlKey || e.metaKey || e.altKey)
        return;
    if (e.code === 'Escape') {
        if (modalType === 'welcome')
            closeModal();
        else if (modalType)
            closeModal();
        else if (inspectedTick !== null)
            setInspection(null);
        else
            openModal('levels');
        return;
    }
    if (modalType)
        return;
    if (e.code in keys) {
        e.preventDefault();
        if (!e.repeat)
            input(keys[e.code]);
        return;
    }
    if (e.repeat)
        return;
    if (e.code === 'KeyR') {
        e.preventDefault();
        performRewind();
    }
    else if (e.code === 'KeyZ') {
        e.preventDefault();
        performUndo();
    }
    else if (e.code === 'KeyX') {
        e.preventDefault();
        performRetry();
    }
    else if (e.code === 'KeyH' || (e.shiftKey && e.code === 'Slash')) {
        e.preventDefault();
        openModal('help');
    }
});
$('#modal').addEventListener('click', e => { if (e.target === $('#modal') && modalType !== 'win')
    closeModal(); });
renderHud();
if (Object.keys(progress.wins).length === 0)
    openModal('welcome');
//# sourceMappingURL=app.js.map