import pkg from '../package.json' with { type: 'json' }
import babel from '@rolldown/plugin-babel'
import multiEntry from '@rollup/plugin-multi-entry'

const getBabelConfig = (targets) =>
  babel({
    include: ['src/**', 'spec/**/*'],
    runtimeVersion: pkg.devDependencies['@babel/runtime'],
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          targets: targets || pkg.browserslist
        }
      ]
    ],
    plugins: [['polyfill-corejs3', { method: 'usage-pure' }]]
  })

export default {
  input: ['spec/setupBrowser.js', 'spec/spec/*/*.js'],
  output: {
    file: 'spec/es5TestBundle.js',
    name: 'SVGTests',
    format: 'iife'
  },
  platform: 'browser',
  plugins: [getBabelConfig(), multiEntry()]
}
