# [WIP] zstd-wasm

<img src="https://github.com/bokuweb/zstd-wasm/workflows/Continuous%20Integration/badge.svg" alt="Build Status" />

## installation

```
npm install @bokuweb/zstd-wasm
```
## examples

### Node.js

``` js
const { init, compress, decompress } = require('@bokuweb/zstd-wasm');

(async () => {
  await init();
  const compressed = compress(Buffer.from('Hello zstd!!'), 10);
  const res = decompress(compressed);
  Buffer.from(res).toString(); // Hello zstd!!
})();
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
}
```

## License

TypeScript glue is provided under the MIT License, and the zstd is provided by Facebook under the BSD 3-Clause License.
