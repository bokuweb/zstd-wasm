import { decompress } from '../lib/simple/decompress';
import { compress } from '../lib/simple/compress';
import { init } from '../lib/index.node';

test('hello', async () => {
  await init();
  const compressed = compress(Buffer.from('Hello'), 10);
  expect(compressed).toMatchSnapshot();
  const decompressed = decompress(compressed);
  expect(Buffer.from(decompressed).toString()).toBe('Hello');
});
