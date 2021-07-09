var Module = typeof Module !== 'undefined' ? Module : {};
var moduleOverrides = {};
var key;
for (key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
var arguments_ = [];
var IS_WEB = typeof window === 'object';
var IS_WORKER = typeof importScripts === 'function';
var IS_NODE =
  typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';
var scriptDirectory = '';
var read_, readAsync, readBinary;
var nodeFS;
var nodePath;
if (IS_NODE) {
  if (IS_WORKER) {
    scriptDirectory = require('path').dirname(scriptDirectory) + '/';
  } else {
    scriptDirectory = __dirname + '/';
  }
  read_ = function shell_read(filename, binary) {
    if (!nodeFS) nodeFS = require('fs');
    if (!nodePath) nodePath = require('path');
    filename = nodePath['resolve'](__dirname, filename);
    return nodeFS['readFileSync'](filename, binary ? null : 'utf8');
  };
  readBinary = function readBinary(filename) {
    var ret = read_(filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    assert(ret.buffer);
    return ret;
  };
  if (process['argv'].length > 1) {
    thisProgram = process['argv'][1].replace(/\\/g, '/');
  }
  arguments_ = process['argv'].slice(2);
  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }
  process['on']('uncaughtException', function (ex) {
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });
  process['on']('unhandledRejection', abort);
  quit_ = function (status) {
    process['exit'](status);
  };
  Module['inspect'] = function () {
    return '[Emscripten Module object]';
  };
} else if (IS_WEB || IS_WORKER) {
  if (IS_WORKER) {
    scriptDirectory = self.location.href;
  } else if (typeof document !== 'undefined' && document.currentScript) {
    scriptDirectory = document.currentScript.src;
  }
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/') + 1);
  } else {
    scriptDirectory = '';
  }
  {
    read_ = function (url) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    };
    if (IS_WORKER) {
      readBinary = function (url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(xhr.response);
      };
    }
    readAsync = function (url, onload, onerror) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function () {
        if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
          onload(xhr.response);
          return;
        }
        onerror();
      };
      xhr.onerror = onerror;
      xhr.send(null);
    };
  }
}
var err = Module['printErr'] || console.warn.bind(console);
for (key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
moduleOverrides = null;
if (Module['arguments']) arguments_ = Module['arguments'];
if (Module['thisProgram']) thisProgram = Module['thisProgram'];
if (Module['quit']) quit_ = Module['quit'];
var setTempRet0 = function (value) {
  tempRet0 = value;
};
var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
if (typeof WebAssembly !== 'object') {
  abort('no native wasm support detected');
}
var wasmMemory;
var ABORT = false;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
function getCFunc(ident) {
  var func = Module['_' + ident];
  assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
  return func;
}
function ccall(ident, returnType, argTypes, args, opts) {
  var toC = {
    array: function (arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
  };
  function convertReturnValue(ret) {
    if (returnType === 'string') return UTF8ToString(ret);
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
  }
  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);
  ret = convertReturnValue(ret);
  if (stack !== 0) stackRestore(stack);
  return ret;
}
function cwrap(ident, returnType, argTypes, opts) {
  argTypes = argTypes || [];
  var numericArgs = argTypes.every(function (type) {
    return type === 'number';
  });
  var numericRet = returnType !== 'string';
  if (numericRet && numericArgs && !opts) {
    return getCFunc(ident);
  }
  return function () {
    return ccall(ident, returnType, argTypes, arguments, opts);
  };
}
var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;
function UTF8ArrayToString(heap, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  return UTF8Decoder.decode(heap.subarray(idx, endPtr));
}
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}
function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer);
}
function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}
var buffer, HEAP8, HEAPU8;
function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module['HEAP8'] = HEAP8 = new Int8Array(buf);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
}
var wasmTable;
var __ATINIT__ = [];
function initRuntime() {
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
function addRunDependency() {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
function removeRunDependency() {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback();
    }
  }
}
function abort(what) {
  if (Module['onAbort']) {
    Module['onAbort'](what);
  }
  what += '';
  err(what);
  ABORT = true;
  what = 'abort(' + what + '). Build with -s ASSERTIONS=1 for more info.';
  var e = new WebAssembly.RuntimeError(what);
  throw e;
}
function isFileURI(filename) {
  return filename.startsWith('file://');
}

var url = !IS_NODE && require('./zstd.wasm');
var binFile = IS_NODE ? 'zstd.wasm' : url.default || url;
function getBinary(file) {
  try {
    if (file == binFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    if (readBinary) {
      return readBinary(file);
    } else {
      throw 'both async and sync fetching of the wasm failed';
    }
  } catch (err) {
    abort(err);
  }
}
function getBinaryPromise() {
  if (!wasmBinary && (IS_WEB || IS_WORKER)) {
    if (typeof fetch === 'function' && !isFileURI(binFile)) {
      return fetch(binFile, { credentials: 'same-origin' })
        .then(function (response) {
          if (!response['ok']) {
            throw "failed to load wasm binary file at '" + binFile + "'";
          }
          return response['arrayBuffer']();
        })
        .catch(function () {
          return getBinary(binFile);
        });
    } else {
      if (readAsync) {
        return new Promise(function (resolve, reject) {
          readAsync(
            binFile,
            function (response) {
              resolve(new Uint8Array(response));
            },
            reject,
          );
        });
      }
    }
  }
  return Promise.resolve().then(function () {
    return getBinary(binFile);
  });
}
function createWasm() {
  var info = { a: asmLibraryArg };
  function receiveInstance(instance, module) {
    var exports = instance.exports;
    Module['asm'] = exports;
    wasmMemory = Module['asm']['d'];
    updateGlobalBufferAndViews(wasmMemory.buffer);
    wasmTable = Module['asm']['q'];
    addOnInit(Module['asm']['e']);
    removeRunDependency('wasm-instantiate');
  }
  addRunDependency('wasm-instantiate');
  function receiveInstantiationResult(result) {
    receiveInstance(result['instance']);
  }
  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise()
      .then(function (binary) {
        var result = WebAssembly.instantiate(binary, info);
        return result;
      })
      .then(receiver, function (reason) {
        err('failed to asynchronously prepare wasm: ' + reason);
        abort(reason);
      });
  }
  function instantiateAsync() {
    if (
      !wasmBinary &&
      typeof WebAssembly.instantiateStreaming === 'function' &&
      !isFileURI(binFile) &&
      typeof fetch === 'function'
    ) {
      return fetch(binFile, { credentials: 'same-origin' }).then(function (response) {
        var result = WebAssembly.instantiateStreaming(response, info);
        return result.then(receiveInstantiationResult, function (reason) {
          err('wasm streaming compile failed: ' + reason);
          err('falling back to ArrayBuffer instantiation');
          return instantiateArrayBuffer(receiveInstantiationResult);
        });
      });
    } else {
      return instantiateArrayBuffer(receiveInstantiationResult);
    }
  }
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      return exports;
    } catch (e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
      return false;
    }
  }
  instantiateAsync();
  return {};
}
function callRuntimeCallbacks(callbacks) {
  while (callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback(Module);
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        wasmTable.get(func)();
      } else {
        wasmTable.get(func)(callback.arg);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
function _emscripten_memcpy_big(dest, src, num) {
  HEAPU8.copyWithin(dest, src, src + num);
}
function emscripten_realloc_buffer(size) {
  try {
    wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16);
    updateGlobalBufferAndViews(wasmMemory.buffer);
    return 1;
  } catch (e) {}
}
function _emscripten_resize_heap(requestedSize) {
  var oldSize = HEAPU8.length;
  requestedSize = requestedSize >>> 0;
  var maxHeapSize = 2147483648;
  if (requestedSize > maxHeapSize) {
    return false;
  }
  for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
    var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
    var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
    var replacement = emscripten_realloc_buffer(newSize);
    if (replacement) {
      return true;
    }
  }
  return false;
}
function _setTempRet0(val) {
  setTempRet0(val);
}
var asmLibraryArg = { c: _emscripten_memcpy_big, a: _emscripten_resize_heap, b: _setTempRet0 };
createWasm();
Module['___wasm_call_ctors'] = function () {
  return (___wasm_call_ctors = Module['___wasm_call_ctors'] = Module['asm']['e']).apply(null, arguments);
};
Module['_malloc'] = function () {
  return (_malloc = Module['_malloc'] = Module['asm']['f']).apply(null, arguments);
};
Module['_free'] = function () {
  return (_free = Module['_free'] = Module['asm']['g']).apply(null, arguments);
};
Module['_ZSTD_isError'] = function () {
  return (_ZSTD_isError = Module['_ZSTD_isError'] = Module['asm']['h']).apply(null, arguments);
};
Module['_ZSTD_getErrorName'] = function () {
  return (_ZSTD_getErrorName = Module['_ZSTD_getErrorName'] = Module['asm']['i']).apply(null, arguments);
};
Module['_ZSTD_compressBound'] = function () {
  return (_ZSTD_compressBound = Module['_ZSTD_compressBound'] = Module['asm']['j']).apply(null, arguments);
};
Module['_ZSTD_compress'] = function () {
  return (_ZSTD_compress = Module['_ZSTD_compress'] = Module['asm']['k']).apply(null, arguments);
};
Module['_ZSTD_getFrameContentSize'] = function () {
  return (_ZSTD_getFrameContentSize = Module['_ZSTD_getFrameContentSize'] = Module['asm']['l']).apply(null, arguments);
};
Module['_ZSTD_decompress'] = function () {
  return (_ZSTD_decompress = Module['_ZSTD_decompress'] = Module['asm']['m']).apply(null, arguments);
};
var stackSave = (Module['stackSave'] = function () {
  return (stackSave = Module['stackSave'] = Module['asm']['n']).apply(null, arguments);
});
var stackRestore = (Module['stackRestore'] = function () {
  return (stackRestore = Module['stackRestore'] = Module['asm']['o']).apply(null, arguments);
});
var stackAlloc = (Module['stackAlloc'] = function () {
  return (stackAlloc = Module['stackAlloc'] = Module['asm']['p']).apply(null, arguments);
});
Module['cwrap'] = cwrap;
var calledRun;
function ExitStatus(status) {
  this.name = 'ExitStatus';
  this.message = 'Program terminated with exit(' + status + ')';
  this.status = status;
}
dependenciesFulfilled = function runCaller() {
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller;
};
function run(args) {
  args = args || arguments_;
  if (runDependencies > 0) {
    return;
  }
  if (runDependencies > 0) {
    return;
  }
  function doRun() {
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;
    if (ABORT) return;
    initRuntime();
    Module['onRuntimeInitialized']();
  }
  doRun();
}
Module['run'] = run;
run();
module.exports = Module;
