import {
  Matrix,
  PointArray,
  Rect,
  SVG,
  Svg,
  Timeline,
  makeMorphable,
  registerMorphableType,
  registerWindow
} from '@svgdotjs/svg.js'

registerWindow(window, document)

const drawing: Svg = SVG()
const rect: Rect = drawing.rect(12, 34)
rect.move(5, 6).fill('#f06')
rect.css('fontSize', '12px')
rect.css('font-size', null)
rect.css({ strokeWidth: '2px', fill: null })
const fontSize: string = rect.css('fontSize')

const timeline = new Timeline()
timeline.reverse().terminate()

new PointArray([[0, 0]]).transformO(new Matrix())
drawing.gradient('linear').stop(0, '#000')

class Pair {
  constructor(public value: number[] = [0, 0]) {}

  init(value: number[]) {
    this.value = value
    return this
  }

  toArray() {
    return this.value
  }
}

registerMorphableType(Pair)
makeMorphable()
