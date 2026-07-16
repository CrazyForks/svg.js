import assert from 'node:assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(dirname, '../..')
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'svgjs-package-'))
const consumer = path.join(temp, 'consumer')
const fixtures = path.join(dirname, 'fixtures')
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const tsc = path.join(
  repo,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tsc.cmd' : 'tsc'
)
const requiredExports = [
  'Element',
  'Rect',
  'Runner',
  'SVG',
  'Svg',
  'Timeline',
  'dispatch',
  'find',
  'getWindow',
  'off',
  'on',
  'parser',
  'registerWindow',
  'withWindow'
]

const runFixture = (fixture) =>
  JSON.parse(
    execFileSync(process.execPath, [fixture], {
      cwd: consumer,
      encoding: 'utf8'
    })
  )

const assertExports = (format, exports) => {
  for (const name of requiredExports) {
    assert(exports.includes(name), `${format} is missing the ${name} export`)
  }
}

fs.mkdirSync(consumer)
fs.cpSync(fixtures, consumer, { recursive: true })

try {
  fs.rmSync(path.join(repo, 'dist'), { recursive: true, force: true })
  execFileSync(pnpm, ['run', 'build'], { cwd: repo, stdio: 'inherit' })
  execFileSync(pnpm, ['run', 'build:polyfills'], {
    cwd: repo,
    stdio: 'inherit'
  })

  const packed = JSON.parse(
    execFileSync(npm, ['pack', '--json', '--pack-destination', temp], {
      cwd: repo,
      encoding: 'utf8'
    })
  )[0].filename

  const tarball = path.join(temp, packed)
  execFileSync(
    npm,
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      tarball,
      'svgdom@latest'
    ],
    { cwd: consumer, stdio: 'inherit' }
  )

  const formats = {
    CommonJS: runFixture('commonjs.cjs'),
    ESM: runFixture('esm.mjs'),
    'browser global': runFixture('browser-global.mjs')
  }

  for (const [format, exports] of Object.entries(formats)) {
    assertExports(format, exports)
    assert.deepStrictEqual(
      exports,
      formats.ESM,
      `${format} exports differ from ESM exports`
    )
  }

  execFileSync(
    tsc,
    [
      '--noEmit',
      '--strict',
      '--skipLibCheck',
      '--target',
      'ES2020',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      'typescript.mts'
    ],
    { cwd: consumer, stdio: 'inherit' }
  )
} finally {
  fs.rmSync(temp, { recursive: true, force: true })
}
