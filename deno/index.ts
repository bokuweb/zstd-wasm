import * as path from 'https://deno.land/std/path/mod.ts';
import Module from './zstd.deno.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const initialized = (() =>
  new Promise<void>((resolve) => {
    Module.onRuntimeInitialized = resolve;
  }))();

export const waitInitialized = async () => {
  await initialized;
};

export const init = async () => {
  const p = path.join(__dirname, 'zstd.wasm');
  const bytes = Deno.readFileSync(p);
  Module['init'](bytes);
  await waitInitialized();
};

const isError = (code: number): number => {
  const _isError = Module.cwrap('ZSTD_isError', 'number', ['number']);
  return _isError(code);
};

// @See https://github.com/facebook/zstd/blob/12c045f74d922dc934c168f6e1581d72df983388/lib/common/error_private.c#L24-L53
const getErrorName = (code: number): string => {
  const _getErrorName = Module.cwrap('ZSTD_getErrorName', 'string', ['number']);
  return _getErrorName(code);
};

const compressBound = (size: number): number => {
  const bound = Module.cwrap('ZSTD_compressBound', 'number', ['number']);
  return bound(size);
};

export const compress = (buf: ArrayBuffer, level: number) => {
  const bound = compressBound(buf.byteLength);
  const malloc = Module.cwrap('malloc', 'number', ['number']);
  const compressed = malloc(bound);
  const free = Module.cwrap('free', 'number');
  try {
    /*
        @See https://zstd.docsforge.com/dev/api/ZSTD_compress/
        size_t ZSTD_compress( void* dst, size_t dstCapacity, const void* src, size_t srcSize, int compressionLevel);
        Compresses `src` content as a single zstd compressed frame into already allocated `dst`.
        Hint : compression runs faster if `dstCapacity` >=  `ZSTD_compressBound(srcSize)`.
        @return : compressed size written into `dst` (<= `dstCapacity),
                  or an error code if it fails (which can be tested using ZSTD_isError()).
      */
    const _compress = Module.cwrap('ZSTD_compress', 'number', ['number', 'number', 'array', 'number', 'number']);
    const sizeOrError = _compress(compressed, bound, buf, buf.byteLength, level);
    if (isError(sizeOrError)) {
      throw new Error(getErrorName(sizeOrError));
    }
    // // Copy buffer
    // // Uint8Array.prototype.slice() return copied buffer.
    const data = new Uint8Array(Module.HEAPU8.buffer, compressed, sizeOrError).slice();
    free(compressed, bound);
    return data;
  } catch (e) {
    free(compressed, bound);
    throw e;
  }
};

const getFrameContentSize = (buf: ArrayBuffer): number => {
  const getSize = Module.cwrap('ZSTD_getFrameContentSize', 'number', ['array', 'number']);
  return getSize(buf, buf.byteLength);
};

export type DecompressOption = {
  defaultHeapSize?: number;
};

export const decompress = (
  buf: ArrayBuffer,
  opts: DecompressOption = { defaultHeapSize: 1024 * 1024 }, // Use 1MB on default if it is failed to get content size.
): ArrayBuffer => {
  const contentSize = getFrameContentSize(buf);
  const size = contentSize === -1 ? opts.defaultHeapSize : contentSize;
  const malloc = Module.cwrap('malloc', 'number', ['number']);
  const free = Module.cwrap('free', 'number');
  const heap = malloc(size);
  try {
    /*
        @See https://zstd.docsforge.com/dev/api/ZSTD_decompress/
        compressedSize : must be the exact size of some number of compressed and/or skippable frames.
        dstCapacity is an upper bound of originalSize to regenerate.
        If user cannot imply a maximum upper bound, it's better to use streaming mode to decompress data.
        @return: the number of bytes decompressed into dst (<= dstCapacity), or an errorCode if it fails (which can be tested using ZSTD_isError()).
      */
    const _decompress = Module.cwrap('ZSTD_decompress', 'number', ['number', 'number', 'array', 'number']);
    const sizeOrError = _decompress(heap, size, buf, buf.byteLength);
    if (isError(sizeOrError)) {
      throw new Error(getErrorName(sizeOrError));
    }
    // Copy buffer
    // Uint8Array.prototype.slice() return copied buffer.
    const data = new Uint8Array(Module.HEAPU8.buffer, heap, sizeOrError).slice();
    free(heap, size);
    return data;
  } catch (e) {
    free(heap, size);
    throw e;
  }
};
