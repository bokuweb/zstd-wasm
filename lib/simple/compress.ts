import { waitInitialized, Module } from '../init';
import { isError, getErrorName } from '../errors';

const compressBound = (size: number): number => {
  const bound = Module.cwrap('ZSTD_compressBound', 'number', ['number']);
  return bound(size);
};

export const compress = async (buf: ArrayBuffer, level: number) => {
  await waitInitialized();
  const bound = compressBound(buf.byteLength);
  const malloc = Module.cwrap('create_buffer', 'number', ['number']);
  const compressed = malloc(bound);
  const free = Module.cwrap('destroy_buffer', 'number');
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
