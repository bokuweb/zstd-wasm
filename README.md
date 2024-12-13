# zstd-wasm

<img src="https://github.com/bokuweb/zstd-wasm/workflows/Continuous%20Integration/badge.svg" alt="Build Status" /> <a href="https://www.npmjs.com/package/@bokuweb/zstd-wasm"><img src="https://img.shields.io/npm/v/@bokuweb/zstd-wasm.svg" alt="Build Status" /></a>
<a href="https://www.npmjs.com/package/@bokuweb/zstd-wasm"><img src="https://img.shields.io/npm/dm/@bokuweb/zstd-wasm.svg" /></a>

Zstandard for browser, Node.js and Deno.
For now support only simple API.

## installation

```
npm install @bokuweb/zstd-wasm
```
## examples

### Node.js

Playground: https://runkit.com/bokuweb/60f1172a58aae5001aea2418

``` js
const { init, compress, decompress } = require('@bokuweb/zstd-wasm');

(async () => {
  await init();
  const compressed = compress(Buffer.from('Hello zstd!!'), 10);
  const res = decompress(compressed);
  Buffer.from(res).toString(); // Hello zstd!!
})();
```

### Deno

See also, https://github.com/bokuweb/zstd-wasm/tree/master/examples/deno

``` ts
import { init, decompress, compress } from 'https://deno.land/x/zstd_wasm/deno/zstd.ts';

await init();
const encoder = new TextEncoder();
const buffer = encoder.encode('Hello World');
const compressed = compress(buffer, 10);
const decompressed = decompress(compressed);
const decoder = new TextDecoder();
console.log(decoder.decode(decompressed));
```
### without bundlers

``` js
import { init, compress, decompress } from '@bokuweb/zstd-wasm';

(async () => {
  await init('./zstd.wasm'); // Please deploy `node_modules/@bokuweb/zstd-wasm/lib/wasm/zstd.wasm` to your hosting server.
  const compressed = compress(Buffer.from('Hello zstd!!'), 10);
  const res = decompress(compressed);
  Buffer.from(res).toString(); // Hello zstd!!
})();
```

---

### with `vite`

Please set following config in `vite.config.js`.

``` js
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@bokuweb/zstd-wasm'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
});
```

---

### with webpack4

We need to use `file-loader` with webpack4.
This is because, webpack doesn’t work well with wasm modules created with Emscripten.
See, https://github.com/webpack/webpack/issues/7352


``` js
import { init, compress, decompress } from '@bokuweb/zstd-wasm';

(async () => {
  await init();
  const compressed = compress(Buffer.from('Hello zstd!!'), 10);
  const res = decompress(compressed);
  Buffer.from(res).toString(); // Hello zstd!!
})();
```

In this case, please install `file-loader` by yourself.

- webpack.config.js
``` js
{
  // ...snipped
  module: {
    rules: [
      {
        test: /zstd\.wasm$/,
        type: 'javascript/auto',
        loader: 'file-loader', // Please use file loader
      },
    ],
  },
}
```

---

### with webpack5

We need to use `Asset Modules` with webpack5.
This is because, webpack doesn’t work well with wasm modules created with Emscripten.
See, https://github.com/webpack/webpack/issues/7352


``` js
import { init, compress, decompress } from '@bokuweb/zstd-wasm';

(async () => {
  await init();
  const compressed = compress(Buffer.from('Hello zstd!!'), 10);
  const res = decompress(compressed);
  Buffer.from(res).toString(); // Hello zstd!!
})();
```

- webpack.config.js
``` js
{
  // ...snipped
  module: {
    rules: [
      {
        test: /zstd\.wasm/,
        type: 'asset/resource',
      },
    ],
  },
  // ...snipped
}
```

## Using dictionary

1. Create the dictionary

`zstd --train FullPathToTrainingSet/* -o dictionaryName`

2. Compress with dictionary

```typescript
const dict = readFileSync('./dict');
const compressed = compressUsingDict(createCCtx(), buffer, dict, 10);
```

3. Decompress with dictionary

``` typescript
const dict = readFileSync('./dict');
const decompressed = decompressUsingDict(createDCtx(), buffer, dict);
```

See also [example](./test/compress_using_dict.test.ts)

## API

### async init(path?: string): Promise<void>

Initialize module.
Please specify path to `zstd.wasm` without bunders on browser.

### compress(buffer: Uint8Array, compressionLevel?: number): Uint8Array

- buffer: data to compress.
- compressionLevel: (optional) compression level, default value is 3

**Example:**

```typescript
const compressed = compress(buffer, 10);
```

### decompress(buffer: Uint8Array): Uint8Array

- buffer: data to decompress.

**Example:**

```typescript
const decompressed = decompress(buffer);
```

### compressUsingDict(cctx: number, buffer: Uint8Array, dict: Uint8Array, compressionLevel?: number): Uint8Array

- cctx: a pointer to compress context. please create cctx with `createCCtx`.
- buffer: data to compress.
- dict: dictionary data.
- compressionLevel: (optional) compression level, default value is 3

**Example:**

```typescript
const dict = readFileSync('./dict');
const compressed = compressUsingDict(createCCtx(), buffer, dict, 10);
```

### createCCtx(): number

- create a pointer to compress context.

### decompressUsingDict(dctx: number, dict: Uint8Array): Uint8Array

- dctx: a pointer to decompress context. please create cctx with `createDCtx`.
- buffer: data to decompress.
- dict: dictionary data.

**Example:**

```typescript
const dict = readFileSync('./dict');
const decompressed = decompressUsingDict(createDCtx(), buffer, dict);
```

### createDCtx(): number

- create a pointer to decompress context.


## License

TypeScript glue is provided under the MIT License, and the zstd is provided by Facebook under the BSD 3-Clause License.
