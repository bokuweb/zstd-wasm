import { init, decompressUsingDict, createDCtx, compressUsingDict, createCCtx } from '@bokuweb/zstd-wasm';
import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';

(async () => {
  await init();
  const buf = Buffer.from('Hello zstd!!');
  const dir = dirname(new URL(import.meta.url).pathname)
  const dict = await readFile(resolve(dir, './json-dict'));
  const compressed = compressUsingDict(createCCtx(), buf, dict, 10);
  const decompressed = decompressUsingDict(createDCtx(), compressed, dict);
  const res = Buffer.from(decompressed).toString();
  console.info(res)
})();
