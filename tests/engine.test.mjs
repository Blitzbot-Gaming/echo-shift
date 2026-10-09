import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, validateLevel } from '../docs/js/levels.js';
import { advance, echoPosition, exportReplay, gatesOpen, importReplay, locate, newSession, plateSignals, restart, retry, rewind, undo } from '../docs/js/engine.js';

const actions = ['up', 'right', 'down', 'left', 'wait'];

/** Time-aware breadth-first search used to verify there is a route to each objective. */
function route(initial, symbol) {
  const destination = locate(initial.level, symbol);
  const queue = [{ session: initial, path: [] }];
  const seen = new Set([`${initial.player.x},${initial.player.y},${initial.tick}`]);
  for (let head = 0; head < queue.length; head++) {
    const { session, path } = queue[head];
    if (session.player.x === destination.x && session.player.y === destination.y) return { session, path };
    if (session.tick >= session.level.maxTicks || session.complete) continue;
    for (const action of actions) {
      const next = advance(session, action).state;
      const key = `${next.player.x},${next.player.y},${next.tick}`;
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({ session: next, path: [...path, action] });
    }
  }
  return null;
}

function solve(level) {
  let session = newSession(level);
  const plates = [...new Set(Object.values(level.gates).flat())];
  const runs = [];
  for (const plate of plates) {
    const solution = route(session, plate);
    assert.ok(solution, `Chamber ${level.id}: can't reach switch ${plate} in time`);
    session = solution.session;
    runs.push({ target: plate, path: solution.path });
    const next = rewind(session);
    assert.notEqual(next, session, `Chamber ${level.id}: can't rewind after reaching ${plate}`);
    session = next;
  }
  const last = route(session, 'X');
  assert.ok(last, `Chamber ${level.id}: no escape route with recorded echoes`);
  session = last.session;
  assert.equal(session.complete, true, `Chamber ${level.id} should be complete`);
  return { session, runs, finish: last.path };
}

test('all chambers pass structural validation', () => {
  for (const level of LEVELS) assert.deepEqual(validateLevel(level), [], level.id);
});

test('all nine chambers are solvable within their beat and echo budgets', () => {
  for (const level of LEVELS) {
    const { session } = solve(level);
    assert.ok(session.tick <= level.maxTicks, level.id);
    assert.ok(session.echoes.length <= level.maxEchoes, level.id);
  }
});

test('walls block movement and blocked inputs still consume a beat', () => {
  const session = newSession(LEVELS[0]);
  const step = advance(session, 'up');
  assert.equal(step.event, 'block');
  assert.deepEqual(step.state.player, session.player);
  assert.equal(step.state.tick, 1);
  assert.equal(step.state.frames[0].blocked, true);
});

test('echoes replay stored resolved positions then hold their final tile', () => {
  let session = newSession(LEVELS[1]);
  session = advance(session, 'right').state;
  session = advance(session, 'right').state;
  session = advance(session, 'down').state;
  assert.equal(session.player.x, 3);
  assert.equal(session.player.y, 2);
  session = advance(session, 'down').state;
  session = rewind(session);
  assert.equal(session.tick, 0);
  assert.equal(session.echoes.length, 1);
  assert.deepEqual(echoPosition(session.echoes[0], 0, session.start), session.start);
  assert.deepEqual(echoPosition(session.echoes[0], 1000, session.start), { x: 3, y: 3, action: 'down', facing: 'down', blocked: false });
  for (let i = 0; i < 5; i++) session = advance(session, 'wait').state;
  assert.equal(plateSignals(session).has('a'), true);
  assert.equal(gatesOpen(session).has('A'), true);
});

test('undo and retry preserve echoes and do not mutate previous snapshots', () => {
  const pristine = newSession(LEVELS[1]);
  let session = advance(pristine, 'right').state;
  session = advance(session, 'down').state;
  const previous = session;
  session = undo(session);
  assert.equal(session.tick, 1);
  assert.equal(session.player.x, 2);
  assert.equal(previous.tick, 2);
  session = rewind(session);
  assert.equal(session.echoes.length, 1);
  session = advance(session, 'right').state;
  session = retry(session);
  assert.equal(session.echoes.length, 1);
  assert.equal(session.tick, 0);
  assert.equal(restart(session).echoes.length, 0);
  assert.equal(pristine.frames.length, 0);
});

test('door requires linked pressure plates, never opens without required echoes', () => {
  const s = newSession(LEVELS[3]);
  assert.equal(gatesOpen(s).has('C'), false);
  const { session } = solve(LEVELS[3]);
  assert.equal(session.echoes.length, 2);
  assert.equal(gatesOpen(session).has('C'), true);
});

test('JSON replay round trip reconstructs all tracks and completion', () => {
  const { session } = solve(LEVELS[5]);
  const restored = importReplay(LEVELS[5], exportReplay(session));
  assert.deepEqual(restored.player, session.player);
  assert.deepEqual(restored.echoes, session.echoes);
  assert.equal(restored.tick, session.tick);
  assert.equal(restored.complete, true);
});

test('replay importer rejects malformed and oversized action tracks', () => {
  const level = LEVELS[0];
  assert.throws(() => importReplay(level, '{}'), /format/);
  assert.throws(() => importReplay(level, JSON.stringify({ format: 'echo-shift/replay-v1', level: '09', echoes: [], current: [] })), /mismatch/);
  assert.throws(() => importReplay(level, JSON.stringify({ format: 'echo-shift/replay-v1', level: '01', echoes: [], current: ['teleport'] })), /actions/);
  assert.throws(() => importReplay(level, JSON.stringify({ format: 'echo-shift/replay-v1', level: '01', echoes: [], current: Array(100).fill('wait') })), /actions/);
});

test('recorder cannot add more echoes than a chamber permits', () => {
  const { session } = solve(LEVELS[1]);
  const after = rewind(session);
  assert.equal(after, session); // completed sessions are immutable
});
