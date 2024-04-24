import { readFile } from 'fs/promises';
import { resolve } from 'path';

import { decompressUsingDict, createDCtx } from '../lib/simple/decompress_using_dict';
import { compressUsingDict, createCCtx } from '../lib/simple/compress_using_dict';
import { init } from '../lib/index.node';

test('using dict', async () => {
  await init();
  const buf = await readFile(resolve(__dirname, './mock/mock.json'));
  const dict = await readFile(resolve(__dirname, './json-dict'));
  const compressed = compressUsingDict(createCCtx(), buf, dict, 10);
  const decompressed = decompressUsingDict(createDCtx(), compressed, dict);
  expect(buf.toString()).toBe(Buffer.from(decompressed).toString());
});
