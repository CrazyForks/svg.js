// We dont need babel. All polyfills are compatible
const config = (ie) => ({
  input: './.config/polyfillListIE.js',
  output: {
    file: 'dist/polyfillsIE.js',
    format: 'iife'
  },
  platform: 'browser'
})

export default [true].map(config)
