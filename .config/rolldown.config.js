import pkg from '../package.json' with { type: 'json' }
import { execFileSync } from 'node:child_process'
import babel from '@rolldown/plugin-babel'

const commitTimestamp = execFileSync(
  'git',
  ['show', '-s', '--format=%ct', 'HEAD'],
  { encoding: 'utf8' }
).trim()
const buildDate = new Date(Number(commitTimestamp) * 1000).toISOString()

const headerLong = `/*!
* ${pkg.name} - ${pkg.description}
* @version ${pkg.version}
* ${pkg.homepage}
*
* @copyright ${pkg.author}
* @license ${pkg.license}
*
* BUILT: ${buildDate}
*/;`

const headerShort = `/*! ${pkg.name} v${pkg.version} ${pkg.license}*/;`

const getBabelConfig = (node = false) => {
  let targets = pkg.browserslist
  const plugins = node ? [] : [['polyfill-corejs3', { method: 'usage-pure' }]]

  if (node) {
    targets = 'maintained node versions'
  }

  return babel({
    include: 'src/**',
    runtimeVersion: node ? undefined : pkg.devDependencies['@babel/runtime'],
    targets,
    presets: [['@babel/preset-env', { modules: false }]],
    plugins
  })
}

// When few of these get mangled nothing works anymore
// We loose literally nothing by let these unmangled
const classes = [
  'A',
  'ClipPath',
  'Defs',
  'Element',
  'G',
  'Image',
  'Marker',
  'Path',
  'Polygon',
  'Rect',
  'Stop',
  'Svg',
  'Text',
  'Tspan',
  'Circle',
  'Container',
  'Dom',
  'Ellipse',
  'Gradient',
  'Line',
  'Mask',
  'Pattern',
  'Polyline',
  'Shape',
  'Style',
  'Symbol',
  'TextPath',
  'Use'
]

const config = (node, min, esm = false) => ({
  input: node || esm ? './src/main.js' : './src/svg.js',
  output: {
    file: esm
      ? './dist/svg.esm.js'
      : node
        ? './dist/svg.node.cjs'
        : min
          ? './dist/svg.min.js'
          : './dist/svg.js',
    format: esm ? 'esm' : node ? 'cjs' : 'iife',
    name: 'SVG',
    sourcemap: true,
    banner: min ? `${headerShort}\n${headerLong}` : headerLong,
    minify: min
      ? {
          mangle: {
            reserved: classes
          }
        }
      : false
  },
  treeshake: {
    // property getter have no sideeffects
    propertyReadSideEffects: false
  },
  platform: node ? 'node' : 'browser',
  plugins: [getBabelConfig(node)]
})

// [node, minified, esm]
const modes = [[false], [false, true], [true], [false, false, true]]

export default modes.map((m) => config(...m))
