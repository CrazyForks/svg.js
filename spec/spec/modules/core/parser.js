/* globals describe, expect, it */

import parser from '../../../../src/modules/core/parser.js'
import { getWindow, registerWindow } from '../../../../src/utils/window.js'

describe('parser.js', () => {
  describe('parser()', () => {
    it('returns an object with svg and path', () => {
      const nodes = parser()
      expect(nodes.path).toBeDefined()
      expect(nodes.svg).toBeDefined()
    })

    it('creates an svg node in the dom', () => {
      expect(getWindow().document.querySelector('svg')).toBe(null)
      const nodes = parser()
      expect(getWindow().document.querySelector('svg')).toBe(nodes.svg.node)
    })

    it('reuses parser instance when it was removed', () => {
      const nodes = parser()
      nodes.svg.remove()
      const nodes2 = parser()
      expect(nodes.svg).toBe(nodes2.svg)
      expect(nodes.path).toBe(nodes2.path)
    })

    it('does not reuse parser nodes after the registered document changes', () => {
      const oldWindow = getWindow()
      const oldDocument = oldWindow.document
      const oldNodes = parser.nodes
      const iframe = oldDocument.createElement('iframe')

      try {
        oldDocument.body.appendChild(iframe)

        let secondWindow = iframe.contentWindow
        let secondDocument = iframe.contentDocument

        if (!secondWindow || !secondDocument) {
          secondWindow = new oldWindow.constructor()
          secondDocument =
            oldDocument.implementation.createHTMLDocument('parser isolation')
          secondWindow.document = secondDocument
          secondDocument.defaultView = secondWindow
        }

        delete parser.nodes
        const firstNodes = parser()

        registerWindow(secondWindow, secondDocument)
        const secondNodes = parser()

        expect(secondNodes).not.toBe(firstNodes)
        expect(secondNodes.svg.node.ownerDocument).toBe(secondDocument)
        expect(secondNodes.path.ownerDocument).toBe(secondDocument)
      } finally {
        if (oldNodes) {
          parser.nodes = oldNodes
        } else {
          delete parser.nodes
        }

        registerWindow(oldWindow, oldDocument)
        iframe.remove()
      }
    })
  })
})
