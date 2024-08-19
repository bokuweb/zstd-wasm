import { Module, waitInitialized } from './module';

export const init = async () => {
  const { readFile } = require('fs/promises');
  const { resolve } = require('path');
  const buf = await readFile(resolve(__dirname, './zstd.wasm'));
  Module['init'](buf);
  await waitInitialized();
};

export * from './simple/decompress';
export * from './simple/compress';

export * from './simple/decompress_using_dict';
export * from './simple/compress_using_dict';
