#!/bin/bash

set -eu

rm -rf ./zstd

git clone https://github.com/facebook/zstd.git zstd

cd zstd

latest=`git describe --tags $(git rev-list --tags --max-count=1)`

echo $latest

git checkout -b $latest

cd build/single_file_libs

bash ./combine.sh -r ../../lib -o ../../../zstd.c ./zstd-in.c

bash ./create_single_file_library.sh

cp zstd.c ../../../zstd.c

cd ../../../

docker run --rm -v $(pwd):/src -u $(id -u):$(id -g) emscripten/emsdk:3.1.0 emcc zstd.c -flto -o ./zstd.js -Oz --memory-init-file 0 --post-js export_module.js -s EXPORTED_FUNCTIONS="['_ZSTD_isError', '_ZSTD_getFrameContentSize', '_ZSTD_decompress', '_ZSTD_compress', '_ZSTD_compress_usingDict', '_ZSTD_decompress_usingDict', '_ZSTD_compressBound', '_malloc', '_free', '_ZSTD_createCCtx', '_ZSTD_createDCtx']" -s FILESYSTEM=0 -s ALLOW_MEMORY_GROWTH=1

cp zstd.wasm lib/wasm/zstd.wasm

