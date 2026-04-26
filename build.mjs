import * as esbuild from 'esbuild';
import { compiler } from 'google-closure-compiler';
import fs from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';

async function runCC(code, flags) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const tmpIn = path.join(tmpdir(), `cc-in-${id}.js`);
    const tmpOut = path.join(tmpdir(), `cc-out-${id}.js`);
    await fs.writeFile(tmpIn, code);
    await new Promise((resolve, reject) => {
        const cc = new compiler({ ...flags, js: tmpIn, js_output_file: tmpOut });
        cc.run((exitCode, _stdout, stderr) => {
            if (exitCode === 0) {
                resolve();
            } else {
                reject(new Error(`Closure Compiler failed:\n${stderr}`));
            }
        });
    });
    const result = await fs.readFile(tmpOut, 'utf8');
    await Promise.all([fs.unlink(tmpIn).catch(() => {}), fs.unlink(tmpOut).catch(() => {})]);
    return result;
}

// --- Step 1: Build worker ---
console.log('Building worker...');
const workerBundled = (await esbuild.build({
    entryPoints: ['src/worker.ts'],
    bundle: true,
    format: 'esm',
    write: false,
    target: 'es6',
})).outputFiles[0].text;

const workerCompiled = await runCC(workerBundled, {
    compilation_level: 'ADVANCED',
    warning_level: 'QUIET',
    language_in: 'ECMASCRIPT6',
    language_out: 'ECMASCRIPT6',
});

const workerWrapped = 'export const createWorker=()=>new Worker(URL.createObjectURL(new Blob([`' +
    workerCompiled.replace(/`/g, '\\`').replace(/\${/g, '\\${') +
    '`]),{type:"application/javascript"}))';

await fs.writeFile('qr-scanner-worker.min.js', workerWrapped);
console.log('  -> qr-scanner-worker.min.js');

// Plugin to inline the pre-built worker module
const inlineWorkerPlugin = {
    name: 'inline-worker',
    setup(build) {
        build.onResolve({ filter: /qr-scanner-worker\.min\.js$/ }, () => ({
            path: 'worker-inline',
            namespace: 'worker-ns',
        }));
        build.onLoad({ filter: /.*/, namespace: 'worker-ns' }, () => ({
            contents: workerWrapped,
            loader: 'js',
        }));
    },
};

// CC WHITESPACE_ONLY rewrites ES module syntax using temp file paths as module IDs,
// breaking ESM output, so we use esbuild here. minifySyntax must stay OFF because
// it converts ['id'] → .id, which CC ADVANCED would rename if users run CC on their
// code that imports this library.
const minifyOptions = {
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: false,
    sourcemap: true,
    target: 'es6',
};

// --- Step 2: qr-scanner.esm.min.js (external worker) ---
console.log('Building qr-scanner.esm.min.js...');
await esbuild.build({
    entryPoints: ['src/qr-scanner.ts'],
    bundle: true,
    format: 'esm',
    external: ['./qr-scanner-worker.min.js'],
    outfile: 'qr-scanner.esm.min.js',
    ...minifyOptions,
});
console.log('  -> qr-scanner.esm.min.js');

// --- Step 3: qr-scanner.esm.all.js (worker inlined) ---
console.log('Building qr-scanner.esm.all.js...');
await esbuild.build({
    entryPoints: ['src/qr-scanner.ts'],
    bundle: true,
    format: 'esm',
    outfile: 'qr-scanner.esm.all.js',
    plugins: [inlineWorkerPlugin],
    ...minifyOptions,
});
console.log('  -> qr-scanner.esm.all.js');

// --- Step 4: qr-scanner.browser.min.js (IIFE, worker inlined) ---
// esbuild wraps default exports as { default: ... } in IIFE format;
// the footer unwraps it so the global is the class itself.
console.log('Building qr-scanner.browser.min.js...');
await esbuild.build({
    entryPoints: ['src/qr-scanner.ts'],
    bundle: true,
    format: 'iife',
    globalName: 'QrScanner',
    outfile: 'qr-scanner.browser.min.js',
    plugins: [inlineWorkerPlugin],
    footer: { js: 'QrScanner=QrScanner.default!==void 0?QrScanner.default:QrScanner;' },
    ...minifyOptions,
});
console.log('  -> qr-scanner.browser.min.js');

console.log('Done.');
