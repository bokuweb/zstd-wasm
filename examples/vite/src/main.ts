import { Buffer } from 'buffer';
import { init, compress, decompress } from '@bokuweb/zstd-wasm';

(async () => {
  const compressAndDecompressTest = () => {
    const compressed = compress(Buffer.from('Hello zstd!!'), 10);
    const res = decompress(compressed);
    const str = Buffer.from(res).toString();
    if (str !== 'Hello zstd!!') throw new Error('Failed to compressAndDecompressTest by zstd.');
    console.log(`%c${str}`, 'color: lightgreen;');
    console.log('%cSucceeded to compressAndDecompressTest.', 'color: lightgreen;');
  };
  await init();
  compressAndDecompressTest();
  document.body.innerText = 'Succeeded';
})().catch((e) => {
  console.error(e);
  document.body.innerText = 'Failed';
});
