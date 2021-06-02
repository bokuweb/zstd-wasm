import { waitInitialized, Module } from '../init';
import { isError, getErrorName } from '../errors';

const getFrameContentSize = (buf: ArrayBuffer): number => {
  const getSize = Module.cwrap('ZSTD_getFrameContentSize', 'number', ['array', 'number']);
  return getSize(buf, buf.byteLength);
};

export const decompress = async (buf: ArrayBuffer): Promise<ArrayBuffer> => {
  await waitInitialized();
  const contentSize = getFrameContentSize(buf);
  const size = contentSize === -1 ? 1024 * 1024 : contentSize;
  const malloc = Module.cwrap('create_buffer', 'number', ['number']);
  const free = Module.cwrap('destroy_buffer', 'number');
  const heap = malloc(size);
  let code;
  try {
    /*
      @See https://zstd.docsforge.com/dev/api/ZSTD_decompress/
      compressedSize : must be the exact size of some number of compressed and/or skippable frames.
      dstCapacity is an upper bound of originalSize to regenerate.
      If user cannot imply a maximum upper bound, it's better to use streaming mode to decompress data.
      @return: the number of bytes decompressed into dst (<= dstCapacity), or an errorCode if it fails (which can be tested using ZSTD_isError()).
    */
    const _decompress = Module.cwrap('ZSTD_decompress', 'number', ['number', 'number', 'array', 'number']);
    code = _decompress(heap, size, buf, buf.byteLength);
    if (isError(code)) {
      throw new Error(getErrorName(code));
    }
  } catch (e) {
    free(heap, code);
    throw e;
  }
  // Copy buffer
  // Uint8Array.prototype.slice() return copied buffer.
  const data = new Uint8Array(Module.HEAPU8.buffer, heap, code).slice();
  free(heap, code);
  return data;
};
