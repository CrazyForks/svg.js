import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const packageRoot = path.join(
  process.cwd(),
  'node_modules',
  '@svgdotjs',
  'svg.js'
)

const load = (filename) => {
  const context = { Date, performance, setTimeout, clearTimeout }
  context.window = context
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context, { filename })
  assert.strictEqual(typeof context.SVG, 'function')
  return Object.keys(context.SVG).sort()
}

const development = load(path.join(packageRoot, 'dist', 'svg.js'))
const minified = load(path.join(packageRoot, 'dist', 'svg.min.js'))
assert.deepStrictEqual(minified, development)
process.stdout.write(JSON.stringify(development))
