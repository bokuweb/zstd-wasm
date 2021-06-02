import { decompress } from '../lib/simple/decompress';
import { compress } from '../lib/simple/compress';

test('hello', async () => {
  const compressed = await compress(Buffer.from('Hello'), 10);
  expect(compressed).toMatchSnapshot();
  const decompressed = await decompress(compressed);
  expect(Buffer.from(decompressed).toString()).toBe('Hello');
});
