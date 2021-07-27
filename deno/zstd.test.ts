import { assertEquals } from 'https://deno.land/std@0.65.0/testing/asserts.ts';

import { init, decompress, compress } from './zstd.ts';

Deno.test({
  name: 'Hello zstd',
  fn: async () => {
    await init();
    const encoder = new TextEncoder();
    const buffer = encoder.encode('Hello World');
    const compressed = compress(buffer, 10);
    const decompressed = decompress(compressed);
    const decoder = new TextDecoder();
    assertEquals(decoder.decode(decompressed), 'Hello World');
  },
});
