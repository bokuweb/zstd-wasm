const Module = require('./wasm/zstd.js');

const initialized = (() =>
  new Promise<void>((resolve) => {
    Module.onRuntimeInitialized = resolve;
  }))();

export const waitInitialized = async () => {
  await initialized;
};

export const init = async (/*path?: string*/) => {
  // Module['init'](path);
  await waitInitialized();
};

export { Module };
