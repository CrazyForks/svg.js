import Jasmine from 'jasmine'
const jasmine = new Jasmine()

jasmine.loadConfig({
  spec_dir: '/',
  spec_files: ['spec/spec/*/**/*.js'],
  helpers: ['spec/setupSVGDom.js']
})

jasmine.execute()
