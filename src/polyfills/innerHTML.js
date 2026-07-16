export function setOuterHTML(node, markupText) {
  const parent = node.parentNode
  if (!parent) return

  try {
    const dXML = new DOMParser()
    dXML.async = false

    const sXML =
      "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>" +
      markupText +
      '</svg>'
    const svgDoc = dXML.parseFromString(sXML, 'text/xml')
    const parseError = svgDoc.parseError

    if (
      (parseError && parseError.errorCode !== 0) ||
      svgDoc.getElementsByTagName('parsererror').length
    ) {
      throw new Error()
    }

    const fragment = node.ownerDocument.createDocumentFragment()
    const svgDocElement = svgDoc.documentElement

    let childNode = svgDocElement.firstChild
    while (childNode) {
      fragment.appendChild(node.ownerDocument.importNode(childNode, true))
      childNode = childNode.nextSibling
    }

    parent.replaceChild(fragment, node)
  } catch (e) {
    throw new Error('Can not set outerHTML on node')
  }
}

export function serializeXML(node) {
  return new XMLSerializer().serializeToString(node)
}

;(function () {
  try {
    if (SVGElement.prototype.innerHTML) return
  } catch (e) {
    return
  }

  Object.defineProperty(SVGElement.prototype, 'innerHTML', {
    get: function () {
      const output = []
      let childNode = this.firstChild
      while (childNode) {
        output.push(serializeXML(childNode))
        childNode = childNode.nextSibling
      }
      return output.join('')
    },
    set: function (markupText) {
      while (this.firstChild) {
        this.removeChild(this.firstChild)
      }

      try {
        const dXML = new DOMParser()
        dXML.async = false

        const sXML =
          "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>" +
          markupText +
          '</svg>'
        const svgDocElement = dXML.parseFromString(
          sXML,
          'text/xml'
        ).documentElement

        let childNode = svgDocElement.firstChild
        while (childNode) {
          this.appendChild(this.ownerDocument.importNode(childNode, true))
          childNode = childNode.nextSibling
        }
      } catch (e) {
        throw new Error('Can not set innerHTML on node')
      }
    }
  })

  Object.defineProperty(SVGElement.prototype, 'outerHTML', {
    get: function () {
      return serializeXML(this)
    },
    set: function (markupText) {
      setOuterHTML(this, markupText)
    }
  })
})()
