import { draftToLevel, exportLevel, importLevel, newDraft, paintTile, validateDraft, EDITOR_TILES, type Draft, type EditorTile } from './editor.js';
import type { Level } from './levels.js';

const STORAGE_KEY = 'echoshift.level-lab.v1';
const names: Record<EditorTile, string> = {
  '#': 'Wall', '.': 'Floor', S: 'Start', X: 'Exit', a: 'Switch a', b: 'Switch b', c: 'Switch c',
  A: 'Gate A', B: 'Gate B', C: 'Gate C', '0': 'Portal 0', '1': 'Portal 1',
};
const escape = (s: string): string => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function restore(): Draft {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s || s.length > 15000) return newDraft();
    const raw: unknown = JSON.parse(s);
    if (!raw || typeof raw !== 'object') return newDraft();
    const data = raw as Partial<Draft>;
    if (typeof data.name !== 'string' || data.name.length > 35 ||
        !Array.isArray(data.map) || data.map.length !== 9 ||
        !data.map.every(row => typeof row === 'string' && row.length === 13 && /^[#.SXabcABC01]+$/.test(row)) ||
        typeof data.maxTicks !== 'number' || typeof data.maxEchoes !== 'number' ||
        !data.circuits || typeof data.circuits !== 'object' ||
        !(['A','B','C'] as const).every(k => typeof data.circuits?.[k] === 'string' && data.circuits[k].length <= 20)) return newDraft();
    return data as Draft;
  } catch { return newDraft(); }
}

export class LevelLab {
  private draft = restore();
  private brush: EditorTile = '#';
  private listeners: AbortController | null = null;

  private save(): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.draft)); } catch { /* private mode */ }
  }

  private render(): string {
    const errors = validateDraft(this.draft);
    const tiles = this.draft.map.map((row, y) => [...row].map((tile, x) => `<button class="editor-tile" type="button" data-editor-cell="${x},${y}" data-tile="${tile}" aria-label="Column ${x + 1}, row ${y + 1}, ${names[tile as EditorTile] ?? 'tile'}" title="${names[tile as EditorTile] ?? 'tile'}">${tile === '.' ? '·' : tile}</button>`).join('')).join('');
    return `<div class="modal-head"><span class="eyebrow">LEVEL LAB / BUILD YOUR OWN EXPERIMENT</span><button data-action="close" class="icon-button modal-close" aria-label="Close editor">✕</button></div>
      <h2>BUILD A <em>TIMELINE.</em></h2><p class="modal-description">Click or drag across the grid to paint tiles. Paired portals connect matching digits. Design, playtest and share your own anomalies.</p>
      <div class="editor-workspace"><div>
        <div class="editor-board-wrap"><div class="editor-board" aria-label="Chamber design grid">${tiles}</div></div>
        <div class="editor-toolbar" aria-label="Tile palette">${EDITOR_TILES.map(t => `<button type="button" data-editor-tool="${t}" class="editor-tool ${t === this.brush ? 'active' : ''}" title="${names[t]}" aria-pressed="${t === this.brush}">${t === '.' ? '·' : t}</button>`).join('')}</div>
        <p class="editor-tool-hint">SELECT A TILE → PAINT ON THE GRID. S AND X ARE UNIQUE. EACH PORTAL DIGIT MUST APPEAR TWICE.</p>
      </div><div class="editor-settings"><strong>CHAMBER PARAMETERS</strong>
        <label class="editor-field">NAME<input id="editorName" value="${escape(this.draft.name)}" maxlength="35" spellcheck="false"/></label>
        <label class="editor-field">BEATS PER LOOP<input id="editorTicks" type="number" min="5" max="60" value="${this.draft.maxTicks}"/></label>
        <label class="editor-field">MAXIMUM ECHOES<select id="editorEchoes">${[0,1,2,3].map(n=>`<option value="${n}" ${n === this.draft.maxEchoes ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        ${(['A','B','C'] as const).map(g=>`<label class="editor-field">GATE ${g} REQUIRES<input id="editorGate${g}" value="${escape(this.draft.circuits[g])}" maxlength="20" spellcheck="false" placeholder="a,b" /></label>`).join('')}
        <div id="editorValidation" class="${errors.length ? 'editor-error' : 'editor-valid'}">${errors.length ? errors.map(escape).join(' · ') : '✓ READY FOR PLAYTEST'}</div>
      </div></div>
      <div class="editor-actions"><button type="button" class="button primary" data-editor-action="test" ${errors.length ? 'disabled' : ''}>▶ PLAYTEST</button>
        <button type="button" class="button outlined" data-editor-action="export">↓ EXPORT JSON</button>
        <button type="button" class="button outlined" data-editor-action="import">↑ IMPORT JSON</button>
        <button type="button" class="button subdued" data-editor-action="reset">↺ RESET DESIGN</button></div>
      <input class="is-hidden" id="editorFile" type="file" accept=".json,application/json" aria-label="Import custom level JSON"/>`;
  }

  mount(root: HTMLElement, onPlay: (level: Level) => void, notify: (message: string) => void): void {
    this.listeners?.abort();
    this.listeners = new AbortController();
    const signal = this.listeners.signal;
    const refresh = (): void => { root.innerHTML = this.render(); this.save(); };
    const validate = (): void => {
      const errors = validateDraft(this.draft);
      const status = root.querySelector<HTMLElement>('#editorValidation');
      if (status) { status.className = errors.length ? 'editor-error' : 'editor-valid'; status.textContent = errors.join(' · ') || '✓ READY FOR PLAYTEST'; }
      const test = root.querySelector<HTMLButtonElement>('[data-editor-action="test"]');
      if (test) test.disabled = errors.length > 0;
      this.save();
    };
    const updateFields = (): void => {
      const value = (id: string): string => root.querySelector<HTMLInputElement>(`#${id}`)?.value ?? '';
      this.draft = { ...this.draft, name: value('editorName').slice(0, 35), maxTicks: Number(value('editorTicks')),
        maxEchoes: Number(value('editorEchoes')), circuits: {
          A: value('editorGateA'), B: value('editorGateB'), C: value('editorGateC'),
        }};
      validate();
    };
    const paint = (cell: HTMLElement): void => {
      const coords = cell.dataset.editorCell?.split(',').map(Number);
      if (!coords || coords.length !== 2) return;
      const next = paintTile(this.draft, coords[0], coords[1], this.brush);
      if (next === this.draft) return;
      this.draft = next;
      refresh();
    };
    root.addEventListener('input', e => {
      if ((e.target as HTMLElement).matches('.editor-field input,.editor-field select')) updateFields();
    }, { signal });
    root.addEventListener('change', e => {
      const target = e.target as HTMLInputElement;
      if (target.id === 'editorFile' && target.files?.[0]) {
        const file = target.files[0];
        if (file.size > 15000) { notify('LEVEL FILE TOO LARGE'); return; }
        file.text().then(text => { try { this.draft = importLevel(text); refresh(); notify('LEVEL LOADED · READY TO PLAYTEST'); }
          catch (error) { notify(`INVALID LEVEL · ${error instanceof Error ? error.message : 'Bad file'}`); } });
      } else if (target.matches('.editor-field input,.editor-field select')) updateFields();
    }, { signal });
    root.addEventListener('click', e => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-editor-tool],[data-editor-cell],[data-editor-action]');
      if (!target) return;
      e.stopPropagation();
      if (target.dataset.editorTool) { this.brush = target.dataset.editorTool as EditorTile; refresh(); return; }
      if (target.dataset.editorCell) { paint(target); return; }
      switch (target.dataset.editorAction) {
        case 'test': {
          const errors = validateDraft(this.draft);
          if (errors.length) { notify(`FIX THE LEVEL · ${errors.join(' · ')}`); return; }
          this.save(); onPlay(draftToLevel(this.draft)); break;
        }
        case 'export': {
          const blob = new Blob([exportLevel(this.draft)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'echo-shift-custom-level.json'; a.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000); notify('LEVEL EXPORTED'); break;
        }
        case 'import': root.querySelector<HTMLInputElement>('#editorFile')?.click(); break;
        case 'reset': this.draft = newDraft(); this.brush = '#'; refresh(); notify('NEW TEMPLATE LOADED'); break;
      }
    }, { signal });
    root.addEventListener('pointerover', e => {
      if (e.buttons !== 1 || e.pointerType === 'touch') return;
      const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-editor-cell]');
      if (cell) paint(cell);
    }, { signal });
    refresh();
  }
}
