const assert = require('node:assert')
const api = require('@svgdotjs/svg.js')
const { createSVGWindow } = require('svgdom')

const window = createSVGWindow()
api.registerWindow(window, window.document)

const drawing = api.SVG()
const rect = drawing.rect(12, 34).move(5, 6)

assert.strictEqual(drawing.node.ownerDocument, window.document)
assert.strictEqual(drawing.node.instance, drawing)
assert.strictEqual(rect.attr('width'), 12)
assert.strictEqual(rect.attr('height'), 34)
assert.strictEqual(rect.x(), 5)
assert.strictEqual(rect.y(), 6)

process.stdout.write(JSON.stringify(Object.keys(api).sort()))
