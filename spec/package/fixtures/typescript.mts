import { Rect, SVG, Svg, registerWindow } from '@svgdotjs/svg.js'

registerWindow(window, document)

const drawing: Svg = SVG()
const rect: Rect = drawing.rect(12, 34)
rect.move(5, 6).fill('#f06')
