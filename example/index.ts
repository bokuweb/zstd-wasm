import { decompress } from '../lib/simple/decompress';
import { compress } from '../lib/simple/compress';

const hello = 'KLUv/SQMYQAASGVsbG8genN0ZCEhN2g+CQ==';

(async () => {
  const decompressTest = async () => {
    const res = await decompress(Buffer.from(hello, 'base64'));
    const str = Buffer.from(res).toString();
    console.log(str);
    if (str !== 'Hello zstd!!') throw new Error('Failed to decompressTest by zstd.');
    console.log(`%c${str}`, 'color: lightgreen;');
    console.log('%cSucceeded to decompressTest.', 'color: lightgreen;');
  };

  const compressAndDecompressTest = async () => {
    const compressed = await compress(Buffer.from('Hello zstd!!'), 10);
    const res = await decompress(compressed);
    const str = Buffer.from(res).toString();
    if (str !== 'Hello zstd!!') throw new Error('Failed to compressAndDecompressTest by zstd.');
    console.log(`%c${str}`, 'color: lightgreen;');
    console.log('%cSucceeded to compressAndDecompressTest.', 'color: lightgreen;');
  };

  await decompressTest();
  await compressAndDecompressTest();
})();
