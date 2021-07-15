const Module = require('./wasm/zstd.js');

const initialized = (() =>
  new Promise<void>((resolve) => {
    Module.onRuntimeInitialized = resolve;
  }))();

export const waitInitialized = async () => {
  await initialized;
};

export const init = async () => {
  Module['init']();
  await waitInitialized();
};

export { Module };
