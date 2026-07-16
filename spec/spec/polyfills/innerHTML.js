/* globals describe, expect, it, pending */

import { serializeXML, setOuterHTML } from '../../../src/polyfills/innerHTML.js'
import { getWindow } from '../../../src/utils/window.js'
import { svg, xlink } from '../../../src/modules/core/namespaces.js'

function setupDocument() {
  const window = getWindow()

  if (typeof window.DOMParser !== 'function') {
    pending('DOMParser is not supported')
  }

  const document = window.document
  const parent = document.createElementNS(svg, 'svg')
  const original = document.createElementNS(svg, 'g')
  original.appendChild(document.createElementNS(svg, 'rect'))
  parent.appendChild(original)

  return { document, original, parent }
}

describe('innerHTML polyfill', () => {
  describe('serializeXML()', () => {
    it('escapes every special character in text', () => {
      const { document } = setupDocument()
      const text = document.createTextNode('a & b & c < d < e > f > g')

      expect(serializeXML(text)).toBe(
        'a &amp; b &amp; c &lt; d &lt; e &gt; f &gt; g'
      )
    })

    it('produces well-formed attributes without changing their values', () => {
      const { document } = setupDocument()
      const element = document.createElementNS(svg, 'g')
      const value = 'one & "two" < three'
      element.setAttribute('data-value', value)

      const parsed = new DOMParser().parseFromString(
        serializeXML(element),
        'text/xml'
      )

      expect(parsed.getElementsByTagName('parsererror').length).toBe(0)
      expect(parsed.documentElement.getAttribute('data-value')).toBe(value)
    })

    it('round-trips text, comments, namespaces, and empty elements', () => {
      const { document } = setupDocument()
      const element = document.createElementNS(svg, 'g')
      element.setAttributeNS(xlink, 'xlink:href', '#one&two')
      element.appendChild(document.createTextNode('a & b < c > d'))
      element.appendChild(document.createComment('preserved'))
      element.appendChild(document.createElementNS(svg, 'circle'))

      const parsed = new DOMParser().parseFromString(
        serializeXML(element),
        'text/xml'
      )
      const parsedElement = parsed.documentElement
      const emptyElement = parsedElement.lastChild

      expect(parsed.getElementsByTagName('parsererror').length).toBe(0)
      expect(parsedElement.namespaceURI).toBe(svg)
      expect(parsedElement.getAttributeNS(xlink, 'href')).toBe('#one&two')
      expect(parsedElement.firstChild.nodeValue).toBe('a & b < c > d')
      expect(parsedElement.childNodes[1].nodeType).toBe(8)
      expect(parsedElement.childNodes[1].nodeValue).toBe('preserved')
      expect(emptyElement.namespaceURI).toBe(svg)
      expect(emptyElement.localName).toBe('circle')
      expect(emptyElement.hasChildNodes()).toBe(false)
    })
  })

  describe('setOuterHTML()', () => {
    it('replaces the original with every parsed node', () => {
      const { original, parent } = setupDocument()

      setOuterHTML(original, '<circle id="first"/><path id="second"/>')

      expect([...parent.children].map((node) => node.localName)).toEqual([
        'circle',
        'path'
      ])
      expect(parent.querySelector('#first')).not.toBeNull()
      expect(parent.querySelector('#second')).not.toBeNull()
      expect(original.parentNode).toBeNull()
    })

    it('does not change a detached node', () => {
      const { original, parent } = setupDocument()
      parent.removeChild(original)
      const child = original.firstChild

      expect(() => setOuterHTML(original, '<circle/>')).not.toThrow()
      expect(original.firstChild).toBe(child)
      expect(child.parentNode).toBe(original)
    })

    it('leaves the original subtree intact when parsing fails', () => {
      const { original, parent } = setupDocument()
      const child = original.firstChild

      expect(() => setOuterHTML(original, '<circle>')).toThrowError(
        'Can not set outerHTML on node'
      )
      expect(parent.firstChild).toBe(original)
      expect(original.firstChild).toBe(child)
      expect(child.parentNode).toBe(original)
    })
  })
})
