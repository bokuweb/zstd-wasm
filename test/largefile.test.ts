import { readFileSync } from 'fs';
import { resolve } from 'path';

import { decompress } from '../lib/simple/decompress';
import { compress } from '../lib/simple/compress';
import { init } from '../lib/init';
import { assert } from 'console';

test('largefile', async () => {
  await init();
  const buf = readFileSync(resolve(__dirname, './large-file'));
  const compressed = compress(buf, 10);
  const decompressed = decompress(compressed);
  assert(buf.equals(Buffer.from(decompressed)));
});