# Architecture — ECHO//SHIFT

This document describes the systems so that reviewers can evaluate the implementation, and beginners can learn the design choices.

## Runtime dependency graph

```text
             index.html / styles.css
                       |
                     app.ts
             /         |         \
       engine.ts   renderer.ts   storage.ts, audio.ts
           |           |
        levels.ts -- engine.ts
```

The game has **no runtime third-party dependencies**. Canvas 2D renders original procedural visuals. Web Audio generates sounds. The only development dependency is TypeScript. The built `docs/` folder is committed and can be hosted without compiling or installing packages.

## Core mechanic: immutable time-loop engine

`engine.ts` is pure: it does not access DOM, canvas, localStorage or audio. All core functions accept a `Session` and return a new one without modifying the input.

A `Session` contains:

- `level`: a map and gate-to-switch relationships.
- `start`, `player`, `facing`: current-player spatial state.
- `tick`: elapsed turns within this loop.
- `frames`: resolved player positions plus attempted actions, facing and collision flags.
- `echoes`: completed recordings from previous loops.
- `complete`: extraction state.

Pressing **R** converts the current `frames` array into an echo and resets the current character. Echoes **replay resolved positions**, not raw input, which guarantees stable playback even if a gate that once allowed movement is now closed. Echoes pass through all characters; they are holograms and only interact with switches. Once an echo finishes its recorded track, it holds the last recorded position until the loop ends.

### Deterministic tick sequence

1. For beat `t + 1`, retrieve each echo's saved position for that beat.
2. Consider all echo positions and the player's position at beat `t` when determining active switches.
3. Open gates whose complete set of linked switches is pressed.
4. Attempt exactly one player action: up, down, left, right or wait. Walls and closed gates block movement. A blocked move still consumes a beat.
5. Append the **resolved** frame to the current player track.
6. If the new tile is the extraction portal, mark the level complete.

### Important invariants

- Each timeline has a maximum number of beats.
- Each level limits the number of echoes.
- An echo cannot change after it is recorded.
- Undo rebuilds the current run by replaying the remaining actions from beat 0; past echoes are unchanged.
- Retry clears only the active track, not echoes.
- Restart clears all echoes and starts the chamber anew.
- No browser-specific dependencies exist inside the model.

## Circuit system

Level maps are equal-width strings. `#` is a wall, `.` floor, `S` player start, `X` exit, `a/b/c` pressure switches, and `A/B/C` gates. Each level defines a `gates` table such as `{ C: ['a', 'b'] }`: gate C only opens while both a and b are pressed.

Every chamber is checked by `validateLevel()` for correct map shape, a single start and exit, and valid gate wiring.

## Renderer

`renderer.ts` draws the board with Canvas 2D. It redraws from the current immutable state on each animation frame. Procedural tile textures, glowing circuitry, a pulse animation, blueprint-style frame decoration and colored ghost silhouettes use no downloaded game art. The canvas scales to its container and device pixel ratio. `reducedMotion` disables time-based pulses.

The inspector can show any beat from the recorded timeline **without mutating gameplay state**. It supplies a read-only reconstructed view to the renderer while `Session` remains untouched.

## App/controller

`app.ts` owns the active session, renders the DOM interface, maps keyboard/touch events to game actions, manages dialogs, formats timelines, coordinates audio feedback and persists successful level clears. Business rules remain in the engine, not in event handlers.

## Persistence

`storage.ts` uses a versioned `localStorage` key `echoshift.save.v1`. Saved data contains unlocked chamber count, the best (echoes, total moves) pair for each cleared chamber, sound preference and reduced-motion preference. Storage errors are handled gracefully, so private browsing does not crash the game.

## Portable replay format

A downloadable JSON file stores the chamber ID and all action tracks:

```json
{
  "format": "echo-shift/replay-v1",
  "level": "02",
  "echoes": [["right", "right", "down", "down"]],
  "current": ["right", "right", "right", "down", "down", "down"]
}
```

Import validates the format, level ID, max echo count, action names and per-loop length. The engine then **re-simulates** the supplied commands; the untrusted file never specifies actor positions directly.

## Test philosophy

The suite uses Node's built-in test runner (`node --test`) with zero runtime dependencies. Beyond unit tests, it uses a *time-aware breadth-first search* to verify that each pressure-switch setup can be recorded and that the exit can be reached within the per-loop beat budget. This guards against accidental changes making a level impossible.

## Future extensions

- A proper level-editor UI with validation and import/export.
- A pure deterministic world snapshot model for movable crates and multi-object switches.
- Replay playback with a draggable global scrubber and frame-by-frame controls.
- Integration tests in the browser and Lighthouse accessibility checks.
- Localization, keyboard remapping and touch swipe controls.
