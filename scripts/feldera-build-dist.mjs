// Builds a browser-ESM `dist/` for consumption by the Feldera web-console.
//
// Why this exists: the upstream `apache-arrow` package.json deliberately omits
// `main`/`module`/`exports` (they are injected by the heavyweight gulp release
// build, which drags in google-closure-compiler/webpack/rollup). The
// web-console only needs the browser ESM target plus type declarations, so we
// produce exactly that here and commit it, keeping `bun install` fast and free
// of an install-time build.
//
// Outputs:
//   dist/Arrow.dom.mjs      - bundled browser ESM (runtime deps left external)
//   dist/Arrow.dom.mjs.map  - source map
//   dist/**/*.d.ts          - full declaration tree (types entry: Arrow.dom.d.ts)
//
// Reproduce after rebasing on upstream:  bun run build:dist

import { build } from 'esbuild'
import { execFileSync } from 'node:child_process'
import { rmSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')

// Runtime dependencies are kept external so they install via this package's
// `dependencies` and dedupe in the consumer, matching the npm package layout.
const external = ['flatbuffers', 'json-with-bigint', 'tslib', '@swc/helpers']

rmSync(dist, { recursive: true, force: true })
mkdirSync(dist, { recursive: true })

console.log('[feldera-build-dist] bundling browser ESM ->', 'dist/Arrow.dom.mjs')
await build({
  entryPoints: [resolve(root, 'src/Arrow.dom.ts')],
  outfile: resolve(dist, 'Arrow.dom.mjs'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  sourcemap: true,
  external,
  logLevel: 'info'
})

console.log('[feldera-build-dist] emitting declarations -> dist/**/*.d.ts')
execFileSync(
  resolve(root, 'node_modules/.bin/tsc'),
  [
    '--declaration',
    '--emitDeclarationOnly',
    '--noCheck',
    '--declarationMap',
    '--module', 'esnext',
    '--moduleResolution', 'bundler',
    '--target', 'es2022',
    '--skipLibCheck',
    '--outDir', dist,
    resolve(root, 'src/Arrow.dom.ts')
  ],
  { cwd: root, stdio: 'inherit' }
)

console.log('[feldera-build-dist] done')
