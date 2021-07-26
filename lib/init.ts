const IS_NODE =
  typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';

const Module = IS_NODE ? require('./wasm/zstd.node.js') : require('./wasm/zstd.js');

const initialized = (() =>
  new Promise<void>((resolve) => {
    Module.onRuntimeInitialized = resolve;
  }))();

export const waitInitialized = async () => {
  await initialized;
};

export const init = async (path?: string) => {
  Module['init'](path);
  await waitInitialized();
};

export { Module };
