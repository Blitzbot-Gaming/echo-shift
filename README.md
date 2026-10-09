<div align="center">

# ECHO//SHIFT

### THE PARADOX PROTOCOL

**Your past is playable.**

A polished, zero-runtime-dependency, browser-based time-loop puzzle game featuring replay ghosts, switch-controlled gates, nine hand-designed chambers, and a visual timeline inspector.

![In-game screenshot](./docs/preview.png)

**[Play offline — standalone HTML](./PLAY_ECHO_SHIFT.html)** · [Read the architecture](./ARCHITECTURE.md) · [Beginner study guide](./STUDY_GUIDE.md)

</div>

> **GitHub Pages:** The online demo is not live until you publish this repository and enable Pages. The standalone HTML file runs locally without installation.

## What makes this interesting

Most time-loop games rely on duplicated player paths. ECHO//SHIFT goes a step further with a **read-only timeline inspector** and portable, validated JSON replays. The simulation is built as pure, testable TypeScript and completely decoupled from its Canvas renderer. This makes the underlying engine easy to test, debug and reuse.

**Features**

- Nine handcrafted chambers across three acts with a rising difficulty curve.
- Deterministic echo tracks that replay recorded positions and hold their final tile.
- One-switch, two-switch and chained-gate puzzles, ending with a three-echo finale.
- Replay inspector: click any beat to view historical actor positions without altering the run.
- Undo, retry active loop, reset whole chamber, level select, hint system and onboarding.
- Keyboard controls plus touch-friendly on-screen D-pad.
- Locally saved level progress, unlocked rooms, best scores, audio and motion preferences.
- Downloadable and importable JSON replays with input validation.
- Procedural original vector art and synthesized sound: **no third-party game assets**.
- Unit tests and a breadth-first solution-finder confirming all nine levels are solvable.

## Start playing

**Option A — zero installation:** Double-click `PLAY_ECHO_SHIFT.html` to launch the **entire game offline** in a modern browser. This single file bundles all styling and code with no dependencies. The `docs/` directory contains the equivalent modular version for hosting.

**Option B — local web server (recommended):** Install Node.js 20 or later, then run:

```sh
npm start
```

Visit **http://localhost:4173/**.

**Option C — develop with TypeScript:**

```sh
npm install
npm run build
npm test
npm start
```

Your edits belong in `src/*.ts`. Run `npm run build` again to refresh the deployable `docs/js/` files. Run `node tools-generate-standalone.mjs` to rebuild the single-file version after source changes. This project uses TypeScript's compiler and the Node.js built-in test runner — not Phaser or React — to make every subsystem fully inspectable for beginners.

## Controls

| Input | Action |
|---|---|
| Arrow keys / WASD | Move one grid square; consumes one beat |
| Space | Wait one beat |
| R | Rewind current timeline and record an echo |
| Z | Undo the last action in the current loop |
| X | Retry current loop; preserve existing echoes |
| Escape | Close a dialog, exit the inspector or open chamber selection |
| H | View instructions |
| Tap | On-screen controls on smaller screens |

### How to solve a time-loop puzzle

1. Move to a glowing pressure plate.
2. Press **R** to record an echo standing on the switch.
3. The current player teleports to the starting tile.
4. As you move, your echo repeats your previous path and eventually stays on the plate.
5. With the gate powered, take your new path through to the exit.
6. In later chambers, coordinate multiple independent echoes and linked gates.

If you're blocked, click **Reveal hint** in the mission panel. The game tracks beat limits separately for each loop.

## Source structure

```text
echo-shift/
├── src/
│   ├── levels.ts        # chamber definitions and map validation
│   ├── engine.ts        # deterministic pure puzzle simulation
│   ├── renderer.ts      # Canvas 2D procedural game art
│   ├── app.ts           # DOM menus, input handling and replay UI
│   ├── audio.ts         # Web Audio synthesis
│   └── storage.ts       # local progress persistence
├── docs/                # GitHub Pages web root, precompiled and deployable
│   ├── index.html
│   ├── styles.css
│   ├── js/
│   └── preview.png
├── PLAY_ECHO_SHIFT.html   # portable, self-contained playable game
├── examples/             # sample solved replay JSON
├── tests/engine.test.mjs
├── .github/workflows/ci.yml
├── ARCHITECTURE.md
├── STUDY_GUIDE.md
├── CONTRIBUTING.md
├── package.json
└── server.mjs
```

## Automated checks

```sh
npm run build     # static TypeScript type checks + compiled JS
npm test          # Node.js built-in test runner
```

The test suite covers map validity, wall collisions, echo recording and hold behavior, undo/retry immutability, gated circuits, replay import/export validation and — most importantly — a BFS-based solvability check for **every chamber**.

## Publish it to GitHub Pages

1. Create a public repository named `echo-shift` on GitHub.
2. Upload or push the **contents of this project folder** to the repo (not the folder itself).
3. Open GitHub repo **Settings → Pages**.
4. Select **Deploy from a branch → main → /docs**, then Save.
5. Visit `https://YOUR-USERNAME.github.io/echo-shift/` after the deployment completes.
6. Replace the placeholder URL at the top of this README and add the live game URL to your repository's **About** section.
7. Add a short recording showing one completed time-loop puzzle to your repository's social preview or README.

The GitHub Actions workflow runs compile and tests on pushes and pull requests. The `docs/` folder includes the prebuilt JavaScript because GitHub Pages does not compile TypeScript.

## Portfolio / CV

**ECHO//SHIFT — Browser-Based Puzzle Game & Replay Engine**

> Developed a nine-level TypeScript puzzle game with deterministic time-loop simulations, multi-agent replay, interactive timeline inspection and validated JSON replay portability. Designed a responsive Canvas 2D interface, implemented automated solvability testing, and prepared the project for GitHub Pages deployment and continuous integration.

Only claim the project as your own independent work to the extent that's accurate: this initial codebase was generated with AI assistance. For interviews, review the code, modify it, test it, and be able to explain how the recording system works.

## License

MIT — see [LICENSE](./LICENSE). All interface graphics are procedurally rendered and do not require proprietary game assets.
