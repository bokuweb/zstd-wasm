import { Module, waitInitialized } from './module';

export const init = async () => {
  const { readFileSync } = require('fs');
  const { resolve } = require('path');
  const buf = readFileSync(resolve(__dirname, './wasm/zstd.wasm'));
  Module['init'](buf);
  await waitInitialized();
};

export * from './simple/decompress';
export * from './simple/compress';

export * from './simple/decompress_using_dict';
export * from './simple/compress_using_dict';
