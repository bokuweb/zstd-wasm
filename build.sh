#!/bin/bash

set -eu

cd zstd/build/single_file_libs

bash ./create_single_file_library.sh

cp zstd.c ../../../zstd.c

cd ../../../

docker run --rm -v $(pwd):/src -u $(id -u):$(id -g) emscripten/emsdk emcc zstd.c -flto -o ./zstd.js -O3 --memory-init-file 0 --post-js export_module.js -s EXPORTED_FUNCTIONS="['_ZSTD_isError', '_ZSTD_getFrameContentSize', '_ZSTD_getErrorName', '_ZSTD_decompress', '_ZSTD_compress', '_ZSTD_compressBound', '_malloc', '_free']" -s EXPORTED_RUNTIME_METHODS="['cwrap']" -s FILESYSTEM=0 -s ALLOW_MEMORY_GROWTH=1

encoded=`base64 -i zstd.wasm`
const="module.exports = \""
end="\";"


echo $const$encoded$end >> lib/wasm/wasm.js

cp zstd.wasm lib/wasm/zstd.wasm