const Module = require("./wasm/zstd.js");

const initialized = (() =>
  new Promise<void>((resolve) => {
    Module.onRuntimeInitialized = resolve;
  }))();

const isError = (code: number): number => {
  const _isError = Module.cwrap("ZSTD_isError", "number", ["number"]);
  return _isError(code);
};

const getErrorName = (code: number): string => {
  const _getErrorName = Module.cwrap("ZSTD_getErrorName", "string", ["number"]);
  return _getErrorName(code);
};

const getFrameContentSize = (buf: ArrayBuffer): number => {
  const getSize = Module.cwrap("ZSTD_getFrameContentSize", "number", [
    "array",
    "number",
  ]);
  return getSize(buf, buf.byteLength);
};

export const decompress = async (buf: ArrayBuffer): Promise<ArrayBuffer> => {
  await initialized;
  const contentSize = getFrameContentSize(buf);
  const size = contentSize === -1 ? 1024 * 1024 : contentSize;
  const malloc = Module.cwrap("create_buffer", "number", ["number"]);
  const free = Module.cwrap("destroy_buffer", "number");
  const heap = malloc(size);
  let code;
  try {
    const _decompress = Module.cwrap("ZSTD_decompress", "number", [
      "number",
      "number",
      "array",
      "number",
    ]);
    code = _decompress(heap, size, buf, buf.byteLength);
    if (isError(code)) {
      throw new Error(getErrorName(code));
    }
  } catch (e) {
    free(heap);
    throw e;
  }
  free(heap);
  return new Uint8Array(Module.HEAPU8.buffer, heap, code);
};
