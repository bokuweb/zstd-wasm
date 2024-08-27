import { Module, waitInitialized } from './module';

export const init = async (path?: string) => {
  // @ts-ignore
  const url = new URL(`./zstd.wasm`, import.meta.url).href;
  Module['init'](path ?? url);
  await waitInitialized();
};

export * from './simple/decompress';
export * from './simple/compress';

export * from './simple/decompress_using_dict';
export * from './simple/compress_using_dict';
