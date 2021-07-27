import { init, decompress, compress } from 'https://deno.land/x/zstd_wasm/deno/zstd.ts';

await init();
const encoder = new TextEncoder();
const buffer = encoder.encode('Hello World');
const compressed = compress(buffer, 10);
const decompressed = decompress(compressed);
const decoder = new TextDecoder();
console.log(decoder.decode(decompressed));
