import { Module } from '../module';
import { isError } from '../errors';
import { DecompressOption } from './decompress';

const getFrameContentSize = (src: number, size: number): number => {
  const getSize = Module['_ZSTD_getFrameContentSize'];
  return getSize(src, size);
};

export const createDCtx = (): number => {
  return Module['_ZSTD_createDCtx']();
};

export const freeDCtx = (dctx: number) => {
  return Module['_ZSTD_freeDCtx'](dctx);
};

export const decompressUsingDict = (
  dctx: number,
  buf: ArrayBuffer,
  dict: ArrayBuffer,
  opts: DecompressOption = { defaultHeapSize: 1024 * 1024 }, // Use 1MB on default if it is failed to get content size.
): ArrayBuffer => {
  const malloc = Module['_malloc'];
  const src = malloc(buf.byteLength);
  Module.HEAP8.set(buf, src);
  const pdict = malloc(dict.byteLength);
  Module.HEAP8.set(dict, pdict);
  const contentSize = getFrameContentSize(src, buf.byteLength);
  const size = contentSize === -1 ? opts.defaultHeapSize : contentSize;
  const free = Module['_free'];
  const heap = malloc(size);
  try {
    const _decompress = Module['_ZSTD_decompress_usingDict'];
    const sizeOrError = _decompress(dctx, heap, size, src, buf.byteLength, pdict, dict.byteLength);
    if (isError(sizeOrError)) {
      throw new Error(`Failed to compress with code ${sizeOrError}`);
    }
    // Copy buffer
    // Uint8Array.prototype.slice() return copied buffer.
    const data = new Uint8Array(Module.HEAPU8.buffer, heap, sizeOrError).slice();
    free(heap, size);
    free(src, buf.byteLength);
    free(pdict, dict.byteLength);
    return data;
  } catch (e) {
    free(heap, size);
    free(src, buf.byteLength);
    free(pdict, dict.byteLength);
    throw e;
  }
};
