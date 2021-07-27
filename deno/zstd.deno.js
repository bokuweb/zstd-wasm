var Module = typeof Module !== 'undefined' ? Module : {};
var moduleOverrides = {};
var key;
for (key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
var arguments_ = [];
var runtimeInitialized;

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
var tempRet0;
var setTempRet0 = function (value) {
  tempRet0 = value;
};
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

function init(bin) {
  var info = { a: asmLibraryArg };
  function receiveInstance(instance) {
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
    return WebAssembly.instantiate(bin, info).then(receiver, function (reason) {
      err('failed to asynchronously prepare wasm: ' + reason);
      abort(reason);
    });
  }
  function instantiateAsync() {
    return instantiateArrayBuffer(receiveInstantiationResult);
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
Module['___wasm_call_ctors'] = function () {
  return (Module['___wasm_call_ctors'] = Module['asm']['e']).apply(null, arguments);
};
Module['_malloc'] = function () {
  return (Module['_malloc'] = Module['asm']['f']).apply(null, arguments);
};
Module['_free'] = function () {
  return (Module['_free'] = Module['asm']['g']).apply(null, arguments);
};
Module['_ZSTD_isError'] = function () {
  return (Module['_ZSTD_isError'] = Module['asm']['h']).apply(null, arguments);
};
Module['_ZSTD_getErrorName'] = function () {
  return (Module['_ZSTD_getErrorName'] = Module['asm']['i']).apply(null, arguments);
};
Module['_ZSTD_compressBound'] = function () {
  return (Module['_ZSTD_compressBound'] = Module['asm']['j']).apply(null, arguments);
};
Module['_ZSTD_compress'] = function () {
  return (Module['_ZSTD_compress'] = Module['asm']['k']).apply(null, arguments);
};
Module['_ZSTD_getFrameContentSize'] = function () {
  return (Module['_ZSTD_getFrameContentSize'] = Module['asm']['l']).apply(null, arguments);
};
Module['_ZSTD_decompress'] = function () {
  return (Module['_ZSTD_decompress'] = Module['asm']['m']).apply(null, arguments);
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
Module['init'] = init;
export default Module;
