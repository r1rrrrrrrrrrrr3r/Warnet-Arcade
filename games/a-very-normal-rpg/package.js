{
  "name": "a-very-normal-rpg-wasm-build",
  "private": true,
  "description": "Build-time deps for vendoring the xterm.js terminal used by the compiled RPG. Not shipped to the browser as-is; files are copied into games/<slug>/vendor by build.sh.",
  "dependencies": {
    "@xterm/xterm": "^5.5.0",
    "@xterm/addon-fit": "^0.10.0"
  }
}