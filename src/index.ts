const Module = require("./zstd/zstd.js");
const { readFileSync, writeFileSync } = require("fs");

const getFrameContentSize = (buf) => {
  const f = Module.cwrap("ZSTD_getFrameContentSize", "number", [
    "array",
    "number",
  ]);
  const size = f(buf, buf.byteLength);
  // サンプルアプリケーションでは1MBを超える場合はエラー扱いにする
  // NOTE: ZSTD_getFrameContentSizeのエラー値はnumber型で表現できない。
  // 厳密にエラーチェックする場合は、C言語のレイヤで判定するラッパー関数を用意すること
  // const content_size_limit = 1 * 1024 * 1024;
  return size;
  // return size <= content_size_limit ? size : null;
};

const decompress = (buf) => {
  const size = getFrameContentSize(buf);
  console.log({ size });
  if (!size) return null;
  console.log("hello");

  // (a) ヒープ領域を確保、伸張データの出力先として使用する
  const malloc = Module.cwrap("create_buffer_with_size", "number", ["number"]);
  const heap = malloc(size);
  console.log(heap);
  const a = Module.cwrap("memset_test", "number", ["number"]);
  a(heap);
  console.log("-0-0-0-0");

  try {
    const d = Module.cwrap("ZSTD_decompress", "number", [
      "number",
      "number",
      "array",
      "number",
    ]);
    console.log("allocated", d);

    const decompress_rc = d(heap, size, buf, buf.byteLength);
    console.log(decompress_rc);
    // if (this.isError(decompress_rc) || decompress_rc != size)
    //   return null;
    // (c) 伸長データをJavaScriptの配列にコピーする
    return new Uint8Array(Module.HEAPU8.buffer, heap, size);
  } finally {
    // (d) 例外発生時に解放漏れしないようにする
    const free = Module.cwrap("destroy_buffer", "number");
    free(heap);
  }
};

const file = readFileSync("./zstd/zstd.wasm.zst");

Module.onRuntimeInitialized = () => {
  console.log("initialized");
  const res = decompress(file);
  console.log(res);
  writeFileSync("./test.wasm", res);
  return res;
};
