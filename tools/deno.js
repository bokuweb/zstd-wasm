const prettier = require('prettier');
const glob = require('glob-all');
const { readFileSync, writeFileSync } = require('fs');

// Ignore index.ts/init.ts
const files = glob.sync('./lib/**/*.ts').filter((name) => name !== './lib/index.ts' && name !== './lib/init.ts');

console.log(files);

const res = files.reduce((code, file) => {
  const content = readFileSync(file, 'utf-8');
  return (
    code +
    '\n\n' +
    prettier.format(content, {
      parser(text, parser) {
        const ast = parser['babel-ts'](text);
        // Remove import and require
        const body = ast.program.body.filter((b) => {
          if (b.type === 'ImportDeclaration') return false;
          if (b.type === 'ExportAllDeclaration') return false;
          if (b.type === 'VariableDeclaration') {
            if (b.declarations[0].init.callee && b.declarations[0].init.callee.name === 'require') {
              return false;
            }
          }
          return true;
        });
        ast.program.body = body;
        return ast;
      },
    })
  );
}, '');

const head = `
import * as path from 'https://deno.land/std/path/mod.ts';
import Module from './zstd.deno.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const initialized = (() =>
  new Promise<void>((resolve) => {
    Module.onRuntimeInitialized = resolve;
  }))();

export const init = async () => {
  const p = path.join(__dirname, 'zstd.wasm');
  const bytes = Deno.readFileSync(p);
  Module['init'](bytes);
  await initialized;
};
`;

writeFileSync('./deno/zstd.ts', head + res);

console.log(`Succeeded to create deno/zstd.ts`);
