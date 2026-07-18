import { isBlank } from '../core/regex.js'
import { registerMethods } from '../../utils/methods.js'
import { unCamelCase } from '../../utils/utils.js'

const cssName = (name) => (name.startsWith('--') ? name : unCamelCase(name))

// Dynamic style generator
export function css(style, val) {
  const ret = {}
  if (arguments.length === 0) {
    const declaration = this.node.style

    for (let i = 0; i < declaration.length; i++) {
      const name = declaration.item(i)
      const value = declaration.getPropertyValue(name)
      const priority = declaration.getPropertyPriority(name)

      ret[name] = priority ? `${value} !${priority}` : value
    }

    return ret
  }

  if (arguments.length < 2) {
    // get style properties as array
    if (Array.isArray(style)) {
      for (const name of style) {
        const cased = cssName(name)
        ret[name] = this.node.style.getPropertyValue(cased)
      }
      return ret
    }

    // get style for property
    if (typeof style === 'string') {
      return this.node.style.getPropertyValue(cssName(style))
    }

    // set styles in object
    if (typeof style === 'object') {
      for (const name in style) {
        // set empty string if null/undefined/'' was given
        this.node.style.setProperty(
          cssName(name),
          style[name] == null || isBlank.test(style[name]) ? '' : style[name]
        )
      }
    }
  }

  // set style for property
  if (arguments.length === 2) {
    this.node.style.setProperty(
      cssName(style),
      val == null || isBlank.test(val) ? '' : val
    )
  }

  return this
}

// Show element
export function show() {
  return this.css('display', '')
}

// Hide element
export function hide() {
  return this.css('display', 'none')
}

// Is element visible?
export function visible() {
  return this.css('display') !== 'none'
}

registerMethods('Dom', {
  css,
  show,
  hide,
  visible
})
