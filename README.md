# [WIP] zstd-wasm

<img src="https://github.com/bokuweb/zstd-wasm/workflows/Continuous%20Integration/badge.svg" alt="Build Status" />

## installation

```
npm install @bokuweb/zstd-wasm
```
## examples

### without bundlers

``` js
import { init, compress, decompress } from '.@bokuweb/zstd-wasm';

(async () => {
  await init('./zstd.wasm'); // Please deploy `node_modules/@bokuweb/zstd-wasm/lib/wasm/zstd.wasm` to your hosting server.
  const compressed = compress(Buffer.from('Hello zstd!!'), 10);
  const res = decompress(compressed);
  Buffer.from(res).toString(); // Hello zstd!!
})();
```

### with webpack4

``` js
import { init, compress, decompress } from '.@bokuweb/zstd-wasm';

(async () => {
  await init();
  const compressed = compress(Buffer.from('Hello zstd!!'), 10);
  const res = decompress(compressed);
  Buffer.from(res).toString(); // Hello zstd!!
})();
```

- webpack.config.js
``` js
  module: {
    rules: [
      {
        test: /zstd\.wasm$/,
        type: 'javascript/auto',
        loader: 'file-loader', // Please use file loader
      },
    ],
  },
```


### with webpack5

``` js
import { init, compress, decompress } from '.@bokuweb/zstd-wasm';

(async () => {
  await init();
  const compressed = compress(Buffer.from('Hello zstd!!'), 10);
  const res = decompress(compressed);
  Buffer.from(res).toString(); // Hello zstd!!
})();
```

- webpack.config.js
``` js
  module: {
    rules: [
      {
        test: /zstd\.wasm/,
        type: 'asset/resource',
      },
    ],
  },
```