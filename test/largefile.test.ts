import { readFile } from 'fs/promises';
import { resolve } from 'path';

import { decompress } from '../lib/simple/decompress';
import { compress } from '../lib/simple/compress';
import { init } from '../lib/index.node';

test('largefile', async () => {
  await init();
  const buf = await readFile(resolve(__dirname, './large-file'));
  const compressed = compress(buf, 10);
  const decompressed = decompress(compressed);
  expect(buf.equals(Buffer.from(decompressed))).toBeTruthy();
});
