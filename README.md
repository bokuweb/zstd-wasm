# zstd-wasm

<img src="https://github.com/bokuweb/zstd-wasm/workflows/Continuous%20Integration/badge.svg" alt="Build Status" />

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

In this case, please install `file-loader` by yourserlf.

- webpack.config.js
``` js
{
  // ...snipped
  node: {
    fs: 'empty',
  },  
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
  resolve: {
    // ...snipped
    fallback: {
      fs: false,
    },
  },
}
```

## API

### async init(path?: string): Promise<void>

Initialize module.
Please specify path to `zstd.wasm` without bunders on browser.

### compress(buffer: ArrayBuffer, compressionLevel?: number): ArrayBuffer

- buffer: data to compress.
- compressionLevel: (optional) compression level, default value is 3

**Example:**

```typescript
const compressed = compress(buffer, 10);
```

### decompress(buffer: ArrayBuffer): ArrayBuffer

- buffer: data to decompress.

**Example:**

```typescript
const decompressed = decompress(buffer);
```

## License

TypeScript glue is provided under the MIT License, and the zstd is provided by Facebook under the BSD 3-Clause License.
