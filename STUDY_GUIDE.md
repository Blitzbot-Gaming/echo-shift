# Understand the project before putting it on your CV

If you are new to programming, don't try to memorize 2,000 lines at once. Understand five core ideas and then make your own improvements. The real value of a portfolio project comes from being able to explain and modify it.

## Week 1: Variables, functions and the grid

Read `src/levels.ts` and `src/engine.ts` functions `tile`, `locate` and `newSession`.

- An `(x, y)` coordinate tells the game where something is.
- A `#` is a wall; `S` marks the starting tile; `X` marks the exit.
- Calling `newSession(level)` returns the initial state of that room.
- A TypeScript interface describes the shape of data, helping the compiler catch mistakes.

**Challenge:** Add your own map (start with a small, ungated room). Add it to the levels collection and check that the tests accept it.

## Week 2: Moving the player

Read `advance()` in `src/engine.ts`.

- A key press becomes an `Action` such as `left` or `wait`.
- The action is translated to a `(dx, dy)` displacement.
- The game checks whether the target square is a wall or locked gate.
- Valid and blocked moves both consume one beat.

**Challenge:** Add an option for the player to make a diagonal move, but only in a special test mode. Decide how wall collisions should work and test it.

## Week 3: Why pure functions matter

Look at how `advance()` returns a **new** `Session` instead of editing the existing session. The original input remains unchanged. This is called *immutability*.

Benefits: easier automated tests, consistent undo behavior and predictable replay.

**Challenge:** Add a test checking that a blocked move does not change the previous session's player position or frame list.

## Week 4: The echo algorithm

Read `rewind()`, `echoPosition()`, `plateSignals()` and `gatesOpen()`.

1. Record each resolved player position after movement.
2. Press R to store those frames permanently as an echo.
3. Reset the current player's position and tick counter.
4. At each new beat, look up the echo's stored position for that beat.
5. Keep the echo on its last position when its track ends.
6. Count echo positions on pressure plates to open gates.

**Challenge:** Change the playback color of the first echo in `src/renderer.ts`, then rebuild using `npm run build`.

## Week 5: Testing and breadth-first search

Read `tests/engine.test.mjs`.

A breadth-first search (BFS) explores possible sequences of actions in order, from short sequences to longer ones. Here it tracks position **and beat** because gate availability can change with time. This checks that the developer hasn't designed an impossible level.

**Challenge:** Modify a wall in level 02 so the gate becomes unreachable. Run `npm test` and observe the failure. Restore the original and confirm the suite passes.

## Week 6: Build and deployment

- `src/` contains source code that humans edit.
- TypeScript compiles into JavaScript under `docs/js/`.
- `docs/index.html` loads the compiled game.
- `PLAY_ECHO_SHIFT.html` bundles all assets into one HTML file that runs offline.
- GitHub Pages serves the `docs/` directory.
- GitHub Actions tests that future changes don't break the build.

**Challenge:** Add an explanatory graphic to the README, change the game title, and publish a new release after verifying all checks pass.

## Interview questions you should be able to answer

**Q: How does the rewind system work?**  
A: Each move records an action and its resolved position. Rewinding freezes that track as a ghost, starts the current player from the beginning and plays back the previously recorded positions on a shared beat clock.

**Q: Why save positions instead of just actions?**  
A: Gate states may change as new ghosts are added. Saved positions guarantee deterministic ghost movement even if the current world's collision conditions are different.

**Q: What algorithms did you use?**  
A: A deterministic state-transition system for gameplay and breadth-first search in tests to check that all puzzle chambers can be completed within their allotted move budgets.

**Q: Why no game framework?**  
A: This project deliberately builds the simulation, rendering and UI separately using browser APIs. That keeps deployment lightweight and demonstrates the fundamentals of a game loop and reusable architecture. A future version could swap in Phaser as a renderer without rewriting core game logic.

**Q: What would you improve next?**  
A: Better focus management and accessibility, a full graphical level editor, a mobile zoom option, richer puzzles with movable obstacles, more comprehensive real-browser tests and a true scrubber supporting playback controls.

## Be truthful about authorship

The first version was generated with AI assistance. A fair description might be: "Built and customized a TypeScript time-loop game with AI-assisted scaffolding; tested, extended, documented and deployed it." Keep adding your own code before presenting it as a project you independently engineered from scratch. Recruiters are often more impressed by a clear technical explanation and thoughtful improvements than by a flashy repository you can't explain.
