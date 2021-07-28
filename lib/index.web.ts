import { Module, waitInitialized } from './module';

export const init = async (path?: string) => {
  const url = require('./wasm/zstd.wasm');
  Module['init'](path ?? url.default ?? url);
  await waitInitialized();
};

export * from './simple/decompress';
export * from './simple/compress';
