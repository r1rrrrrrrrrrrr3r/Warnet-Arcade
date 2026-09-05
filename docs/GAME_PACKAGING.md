# Game Packaging Guide

How to turn a finished game into something WarnetArcade can serve. This assumes you've read the "Adding a Game" section of the root [`README.md`](../README.md) already, this doc only covers the engine-specific packaging steps.

## Where games live

Every game gets its own folder at the repo root:

```
games/
└── <slug>/
    ├── index.html   # required, this is what the iframe loads (entryFile)
    ├── cover.png    # required, used as coverImage
    └── ...           # anything else index.html references relatively
```

The backend serves this folder as static files under `/games/*`. Nothing outside `index.html` and `cover.png` is required by the app itself, but if your build produces extra folders (Unity's `Build/`, `TemplateData/`, etc.), they need to sit alongside `index.html` with their relative paths intact, don't flatten or rename them.

## The `engine` field matters functionally

It's not just a display badge. `ArcadeRuntime` checks it against `/scratch|turbowarp/i` (case-insensitive substring match) to decide layout:

- **Matches** ("Scratch", "TurboWarp", etc.): the player is locked to a fixed 4:3 stage and scaled as a block, matching how Scratch/TurboWarp projects render natively.
- **Doesn't match** (anything else, e.g. "Unity", "WebAssembly"): the player fills its container responsively.

Get this wrong and a Scratch game will stretch out of its native aspect ratio, or a Unity/WASM game will get boxed into a 4:3 frame it wasn't designed for.

## Packaging: Scratch (via TurboWarp Packager)

1. Open your project's `.sb3` in [TurboWarp Packager](https://packager.turbowarp.org).
2. Export as **HTML** (the single-file, self-contained output, everything embedded, no separate assets folder needed).
3. Rename the exported file to `index.html` and place it at `games/<slug>/index.html`.
4. Add a `cover.png` manually, the packager doesn't generate one.
5. Set `engine` to `"Scratch"` so it gets the fixed 4:3 treatment described above.

## Packaging: Unity (WebGL)

1. In Unity, `File > Build Settings > WebGL > Build`, with the output directory set directly to `games/<slug>/`.
2. Leave the generated `index.html`, `Build/`, and `TemplateData/` folders as Unity produced them, don't restructure.
3. In **Player Settings > Publishing Settings**, enable **Decompression Fallback**. The backend serves static files as-is with no special `Content-Encoding` handling for gzip/Brotli-compressed WebGL builds, so without this setting the browser may fail to decompress and load the `Build/` files.
4. Add a `cover.png` manually.
5. Set `engine` to `"Unity"` (or anything that doesn't match the Scratch/TurboWarp pattern) so the player renders full-bleed and responsive.

## Packaging: C++ / Emscripten

Based on how `a-very-normal-rpg` was packaged: a plain C++ console program (blocking `cin`/`cout`) compiled to WebAssembly with no changes to the original game logic.

1. Compile with Emscripten to a single HTML shell:
   ```bash
   emcc main.cpp -o index.html -sASYNCIFY
   ```
   `-sASYNCIFY` is the important flag here: it's what lets blocking `std::cin` reads pause WASM execution and resume once JS delivers input, without which a console app that blocks on stdin will just hang the browser tab.
2. Wire terminal I/O to a browser-side terminal emulator (an `xterm.js` shell or even a styled `<textarea>` works): feed keystrokes into Emscripten's `Module['stdin']` callback, and render output via `Module['print']` / `Module['printErr']`.
3. Don't touch the original C++ `cin`/`cout` calls, Asyncify plus the JS-side terminal bridge is what makes them work unmodified in the browser.
4. Output should still be a single `index.html` (plus the `.wasm`/`.js` glue files Emscripten emits alongside it) at `games/<slug>/`.
5. Add a `cover.png` manually.
6. Set `engine` to `"WebAssembly"` (or similar, anything not matching the Scratch pattern).

## Pre-publish checklist

- [ ] `games/<slug>/index.html` loads directly at `http://localhost:3000/games/<slug>/index.html` with the backend running
- [ ] `games/<slug>/cover.png` exists and looks right
- [ ] `Game` row created with `slug`, `title`, `description`, `howToPlay`, `devComment`, `coverImage`, `entryFile`, `engine`
- [ ] `engine` double-checked against the Scratch/TurboWarp regex if this is a Scratch project
- [ ] `published: true` once it's ready to appear in the library