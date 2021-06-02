import * as Benchmark from 'benchmark';
import { readFileSync } from 'fs';

import { decompress } from '../lib/simple/decompress';
import { compress } from '../lib/simple/compress';

const suite = new Benchmark.Suite();

const html = readFileSync('./benchmark/example.html');
const zst = readFileSync('./benchmark/example.html.zst');

console.log(html.byteLength);
console.log(zst.byteLength);

suite
  .add('compress level 10', async () => {
    await compress(html, 10);
  })
  .add('decompress', async () => {
    await decompress(zst);
  })
  .on('cycle', (event: any) => {
    console.log(String(event.target));
  })
  .run({ async: true });
