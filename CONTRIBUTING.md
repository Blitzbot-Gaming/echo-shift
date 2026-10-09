# Contributing

Thanks for your interest in ECHO//SHIFT!

## Local workflow

1. Install Node.js 20+.
2. Run `npm install` once.
3. Edit TypeScript under `src/` (not compiled files under `docs/js`).
4. Run `npm run build` and `npm test`.
5. Review the interface through `npm start` before submitting changes.

## Engineering guidelines

- Game rules must be pure and independent from rendering.
- Avoid mutating `Session`, `Echo` and `Frame` objects.
- New chambers must pass `validateLevel()` and the automated BFS solvability test.
- Favor clear interfaces over adding framework dependencies.
- Maintain both keyboard and touch accessibility for new gameplay actions.
- Don't add remote runtime dependencies without a concrete reason.

## Suggested first contributions

- Improve keyboard focus management in the modal system.
- Expand automated browser tests.
- Add a puzzle reset confirmation option.
- Add a challenge clock or player-defined replay bookmarks.
