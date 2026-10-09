import { echoPosition, gatesOpen, locate, plateSignals, tile } from './engine.js';
const W = 1000;
const H = 650;
const colors = { a: '#6fe7ff', b: '#c7a5ff', c: '#ffce82' };
const echoColors = ['#65e1ff', '#ba94ff', '#ffb47c'];
function rr(ctx, x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
}
function outline(ctx, x, y, w, h, r, color, width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.stroke();
}
function line(ctx, x1, y1, x2, y2, color, width = 1) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();
}
function disk(ctx, x, y, r, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}
function ring(ctx, x, y, r, stroke, thickness = 1) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
}
export class GameRenderer {
    ctx;
    canvas;
    current;
    reduceMotion;
    raf = 0;
    animationStart = performance.now();
    inspectedTick = null;
    stars;
    constructor(canvas, current, reduceMotion) {
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx)
            throw new Error('Your browser does not support the Canvas 2D API.');
        this.ctx = ctx;
        this.canvas = canvas;
        this.current = current;
        this.reduceMotion = reduceMotion;
        let seed = 717;
        const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
        this.stars = Array.from({ length: 115 }, () => ({ x: random() * W, y: random() * H, size: 0.5 + random() * 1.5, phase: random() * Math.PI * 2 }));
        this.resize();
        window.addEventListener('resize', this.resize);
        this.frame = this.frame.bind(this);
        this.raf = requestAnimationFrame(this.frame);
    }
    resize = () => {
        const ratio = Math.min(2, window.devicePixelRatio || 1);
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = Math.max(1, Math.round(rect.width * ratio));
        this.canvas.height = Math.max(1, Math.round(rect.height * ratio));
    };
    setInspectTick(tick) { this.inspectedTick = tick; }
    destroy() { cancelAnimationFrame(this.raf); window.removeEventListener('resize', this.resize); }
    frame = () => {
        let state = this.current();
        if (this.inspectedTick !== null) {
            const tick = this.inspectedTick;
            const frame = state.frames[Math.min(tick - 1, state.frames.length - 1)];
            state = { ...state, tick, player: tick > 0 && frame ? { x: frame.x, y: frame.y } : state.start, facing: tick > 0 && frame ? frame.facing : 'down', complete: false };
        }
        this.draw(state);
        this.raf = requestAnimationFrame(this.frame);
    };
    draw(state) {
        const ctx = this.ctx;
        ctx.setTransform(this.canvas.width / W, 0, 0, this.canvas.height / H, 0, 0);
        ctx.clearRect(0, 0, W, H);
        const t = this.reduceMotion() ? 0 : (performance.now() - this.animationStart) / 1000;
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#0c1726');
        bg.addColorStop(0.52, '#0a111e');
        bg.addColorStop(1, '#131526');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#a5c8e90a';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 35)
            line(ctx, x, 0, x, H, '#a5c8e908');
        for (let y = 0; y < H; y += 35)
            line(ctx, 0, y, W, y, '#a5c8e908');
        for (const star of this.stars)
            disk(ctx, star.x, star.y, star.size, `rgba(127,188,222,${0.08 + (Math.sin(t * 0.7 + star.phase) + 1) * 0.07})`);
        // Decorative engineering diagram elements at the canvas edge.
        line(ctx, 34, 34, 120, 34, '#74dbf950');
        line(ctx, 34, 34, 34, 88, '#74dbf950');
        line(ctx, W - 34, H - 34, W - 120, H - 34, '#74dbf950');
        line(ctx, W - 34, H - 34, W - 34, H - 88, '#74dbf950');
        ctx.textBaseline = 'middle';
        ctx.font = '600 11px ui-monospace, Consolas, monospace';
        ctx.fillStyle = '#627b94';
        ctx.fillText(`CHAMBER / ${state.level.id}`, 42, 53);
        ctx.textAlign = 'right';
        ctx.fillText('SPATIAL ANOMALY DETECTED', W - 45, 53);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#25394f';
        ctx.fillText('SYNC_GRID · v1.1', 42, H - 48);
        ctx.textAlign = 'right';
        ctx.fillText('ECHO//SHIFT  —  THE PARADOX PROTOCOL', W - 42, H - 48);
        ctx.textAlign = 'left';
        const map = state.level.map;
        const rows = map.length;
        const cols = map[0].length;
        const size = Math.min(57.5, 800 / cols, 514 / rows);
        const left = (W - cols * size) / 2;
        const top = (H - rows * size) / 2 + 7;
        const pw = cols * size;
        const ph = rows * size;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 40;
        rr(ctx, left - 17, top - 17, pw + 34, ph + 34, 13, '#070d17');
        ctx.shadowBlur = 0;
        outline(ctx, left - 17, top - 17, pw + 34, ph + 34, 13, '#48627876');
        outline(ctx, left - 9, top - 9, pw + 18, ph + 18, 8, '#1c3245');
        // Tiny measurement ticks along the frame.
        for (let i = 0; i <= cols; i++) {
            const x = left + i * size;
            line(ctx, x, top - 15, x, top - 10, '#58849d72');
            line(ctx, x, top + ph + 10, x, top + ph + 15, '#58849d72');
        }
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const p = { x, y };
                const px = left + x * size;
                const py = top + y * size;
                const symbol = tile(state.level, p);
                if (symbol === '#') {
                    rr(ctx, px + 1, py + 1, size - 2, size - 2, 3, '#172535');
                    rr(ctx, px + 4, py + 4, size - 8, size - 8, 2, '#1c2f40');
                    line(ctx, px + 6, py + 6, px + size - 7, py + 6, '#3c596870', 1.5);
                    line(ctx, px + 6, py + size - 7, px + size - 7, py + size - 7, '#0d1b2b');
                    if ((x * 5 + y * 11) % 4 === 0) {
                        line(ctx, px + size * .68, py + size * .28, px + size * .85, py + size * .28, '#46627964', 2);
                    }
                }
                else {
                    rr(ctx, px + 0.5, py + 0.5, size - 1, size - 1, 1.5, ((x + y) % 2 === 0) ? '#0e1b2b' : '#101e2e');
                    outline(ctx, px + 1, py + 1, size - 2, size - 2, 1, '#27435866', .6);
                    const dotX = px + 6;
                    const dotY = py + 6;
                    disk(ctx, dotX, dotY, 1.05, '#355a6e65');
                }
            }
        }
        const signals = plateSignals(state);
        const open = gatesOpen(state);
        // Circuit paths render behind gates and switches.
        for (const [gate, requirements] of Object.entries(state.level.gates)) {
            const target = locate(state.level, gate);
            for (const requirement of requirements) {
                const source = locate(state.level, requirement);
                const x1 = left + (source.x + .5) * size;
                const y1 = top + (source.y + .5) * size;
                const x2 = left + (target.x + .5) * size;
                const y2 = top + (target.y + .5) * size;
                ctx.save();
                ctx.setLineDash([3, 8]);
                line(ctx, x1, y1, x2, y2, signals.has(requirement) ? `${colors[requirement] ?? '#90e5ef'}9c` : '#45657a44', 1.5);
                ctx.restore();
            }
        }
        for (let y = 0; y < rows; y++)
            for (let x = 0; x < cols; x++) {
                const symbol = map[y][x];
                const px = left + x * size;
                const py = top + y * size;
                const cx = px + size / 2;
                const cy = py + size / 2;
                if (symbol === 'S') {
                    outline(ctx, px + 6, py + 6, size - 12, size - 12, 4, '#6bd8ec4b');
                    line(ctx, cx - 7, cy + size * .29, cx + 7, cy + size * .29, '#7fdffb5e');
                }
                if (/^[a-z]$/.test(symbol)) {
                    const active = signals.has(symbol);
                    const color = colors[symbol] ?? '#8bffcc';
                    rr(ctx, px + 5, py + 5, size - 10, size - 10, 7, active ? `${color}24` : '#173349');
                    outline(ctx, px + 5, py + 5, size - 10, size - 10, 7, active ? color : `${color}85`, active ? 2.3 : 1.4);
                    ring(ctx, cx, cy, size * .26, active ? color : `${color}70`, 2);
                    ring(ctx, cx, cy, size * .11 + (active ? Math.sin(t * 3) * 1.2 : 0), color, 2);
                    disk(ctx, cx, cy, active ? 4.6 : 3, color);
                    ctx.textAlign = 'right';
                    ctx.font = '700 10px ui-monospace, monospace';
                    ctx.fillStyle = active ? color : '#7295aa';
                    ctx.fillText(symbol.toUpperCase(), px + size - 10, py + size - 10);
                    ctx.textAlign = 'left';
                }
                if (/^[0-9]$/.test(symbol)) {
                    const pulse = this.reduceMotion() ? 0 : Math.sin(t * 2.2 + Number(symbol)) * .08;
                    ctx.save();
                    ctx.shadowColor = '#bc9cff';
                    ctx.shadowBlur = 19;
                    ring(ctx, cx, cy, size * (.31 + pulse), '#d3aaff', 3);
                    ctx.shadowBlur = 0;
                    ring(ctx, cx, cy, size * .20, '#8760d7', 2);
                    disk(ctx, cx, cy, size * .10, '#6341a5');
                    ctx.fillStyle = '#fff2ff';
                    ctx.font = '700 12px ui-monospace, monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(symbol, cx, cy);
                    ctx.textAlign = 'left';
                    ctx.restore();
                }
                if (symbol in state.level.gates) {
                    const active = open.has(symbol);
                    const color = active ? '#73eab8' : '#fa977e';
                    rr(ctx, px + 4, py + 3, size - 8, size - 6, 3, active ? '#14362f' : '#502e37');
                    outline(ctx, px + 5, py + 4, size - 10, size - 8, 2, color, 2);
                    if (!active) {
                        for (let k = 0; k < 4; k++) {
                            const xx = px + 12 + k * ((size - 24) / 3);
                            line(ctx, xx, py + 8, xx, py + size - 8, '#ffa8969e', 2);
                        }
                    }
                    else {
                        line(ctx, cx - 9, cy, cx - 2, cy + 7, color, 2);
                        line(ctx, cx - 2, cy + 7, cx + 11, cy - 8, color, 2);
                    }
                    ctx.font = '700 9px ui-monospace, monospace';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = color;
                    ctx.fillText(active ? 'OPEN' : 'LOCK', cx, py + size - 5);
                    ctx.textAlign = 'left';
                }
                if (symbol === 'X') {
                    const pulse = this.reduceMotion() ? 0.5 : (Math.sin(t * 2.5) + 1) * .5;
                    const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, size * .65);
                    glow.addColorStop(0, `rgba(107,255,179,${0.23 + pulse * 0.12})`);
                    glow.addColorStop(1, 'rgba(107,255,179,0)');
                    ctx.fillStyle = glow;
                    ctx.fillRect(px - 12, py - 12, size + 24, size + 24);
                    ring(ctx, cx, cy, size * (.27 + pulse * .035), '#76eebf', 2);
                    ring(ctx, cx, cy, size * .14, '#a2f7d3', 1.7);
                    disk(ctx, cx, cy, size * .06, '#a3ffd4');
                    for (let a = 0; a < 4; a++) {
                        const angle = t * .55 + a * Math.PI / 2;
                        disk(ctx, cx + Math.cos(angle) * size * .34, cy + Math.sin(angle) * size * .34, 2, '#a5ffd8');
                    }
                }
            }
        // Current-run trail under the echoes and the player.
        if (state.frames.length) {
            ctx.save();
            ctx.setLineDash([4, 7]);
            ctx.beginPath();
            ctx.moveTo(left + (state.start.x + .5) * size, top + (state.start.y + .5) * size);
            for (const frame of state.frames)
                ctx.lineTo(left + (frame.x + .5) * size, top + (frame.y + .5) * size);
            ctx.strokeStyle = '#7ef6c34a';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }
        // Recorded tracks are always drawn using the resolved positions, never simulated afresh.
        state.echoes.forEach((echo, index) => {
            const color = echoColors[index % echoColors.length];
            const first = state.start;
            ctx.beginPath();
            ctx.moveTo(left + (first.x + .5) * size, top + (first.y + .5) * size);
            for (const frame of echo.frames)
                ctx.lineTo(left + (frame.x + .5) * size, top + (frame.y + .5) * size);
            ctx.strokeStyle = `${color}28`;
            ctx.lineWidth = 2;
            ctx.stroke();
            const pos = echoPosition(echo, state.tick, state.start);
            const frame = echo.frames[Math.min(Math.max(state.tick - 1, 0), echo.frames.length - 1)];
            this.actor(ctx, left + (pos.x + .5) * size, top + (pos.y + .5) * size, size, color, frame?.facing ?? 'down', true, index + 1, t);
        });
        this.actor(ctx, left + (state.player.x + .5) * size, top + (state.player.y + .5) * size, size, '#a4ffd7', state.facing, false, 0, t);
        if (state.complete) {
            ctx.fillStyle = '#9cf6c820';
            ctx.fillRect(left, top, pw, ph);
        }
    }
    actor(ctx, x, y, size, color, facing, echo, index, t) {
        ctx.save();
        if (echo)
            ctx.globalAlpha = .72 + Math.sin(t * 3.5 + index) * .07;
        const glow = ctx.createRadialGradient(x, y, 2, x, y, size * .52);
        glow.addColorStop(0, echo ? `${color}47` : `${color}4a`);
        glow.addColorStop(1, `${color}00`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, size * .52, 0, Math.PI * 2);
        ctx.fill();
        ring(ctx, x, y, size * (echo ? .29 : .34), echo ? `${color}a2` : `${color}7c`, echo ? 1.2 : 2);
        ctx.translate(x, y);
        const rotation = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 };
        ctx.rotate(rotation[facing]);
        ctx.shadowColor = color;
        ctx.shadowBlur = echo ? 13 : 22;
        ctx.fillStyle = echo ? '#102f48' : '#092b2a';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(0, -size * .30);
        ctx.lineTo(size * .20, -size * .02);
        ctx.lineTo(size * .15, size * .19);
        ctx.lineTo(0, size * .13);
        ctx.lineTo(-size * .15, size * .19);
        ctx.lineTo(-size * .20, -size * .02);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        line(ctx, 0, -size * .18, 0, size * .04, color, 2.4);
        ctx.restore();
        if (echo) {
            ctx.font = '700 10px ui-monospace, monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = color;
            ctx.fillText(`E${index}`, x, y + size * .42);
            ctx.textAlign = 'left';
        }
    }
}
//# sourceMappingURL=renderer.js.map