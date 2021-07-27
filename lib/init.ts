const { readFileSync } = require('fs');
const { resolve } = require('path');

const Module = require('./wasm/zstd.js');

const IS_NODE =
  typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';

const initialized = (() =>
  new Promise<void>((resolve) => {
    Module.onRuntimeInitialized = resolve;
  }))();

export const waitInitialized = async () => {
  await initialized;
};

export const init = async (path?: string) => {
  if (IS_NODE) {
    const buf = readFileSync(resolve(__dirname, './wasm/zstd.wasm'));
    Module['init'](buf);
  } else {
    var url = require('./wasm/zstd.wasm');
    Module['init'](path ?? url.default ?? url);
  }
  await waitInitialized();
};

export { Module };
