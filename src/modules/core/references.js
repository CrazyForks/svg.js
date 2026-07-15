import { adopt } from '../../utils/adopter.js'
import { reference } from './regex.js'
import { globals } from '../../utils/window.js'
import List from '../../types/List.js'

function getReferenceId(value) {
  // Only local fragments resolve here. External URLs deliberately return null.
  let referenceValue = (value + '').trim()
  const url = referenceValue.match(/^url\((.*)\)$/i)

  if (url) {
    referenceValue = url[1].trim()

    const quote = referenceValue[0]
    if (quote === '"' || quote === "'") {
      if (referenceValue[referenceValue.length - 1] !== quote) return null
      referenceValue = referenceValue.slice(1, -1)
    }
  }

  const match = referenceValue.match(reference)
  return match ? match[1].slice(1) : null
}

function findById(rootNode, id) {
  const selector = `#${globals.window.CSS.escape(id)}`

  // querySelector() does not include an Element root in its own search.
  if (rootNode.nodeType === 1 && rootNode.matches(selector)) return rootNode

  return rootNode.querySelector(selector)
}

export function resolveReference(node, value) {
  const id = getReferenceId(value)
  return id ? findById(node.getRootNode(), id) : null
}

export function findReferences(node, attribute, selector = `[${attribute}]`) {
  const id = node.getAttribute('id')
  const rootNode = node.getRootNode()

  // With duplicate IDs, only the node resolved by a forward lookup owns targets.
  if (!id || findById(rootNode, id) !== node) return new List()

  const references = []

  // querySelectorAll() also excludes an Element root from its results.
  if (
    rootNode.nodeType === 1 &&
    rootNode.matches(selector) &&
    getReferenceId(rootNode.getAttribute(attribute)) === id
  ) {
    references.push(adopt(rootNode))
  }

  // Parse candidate values so quoted/whitespace URL forms remain equivalent.
  for (const element of rootNode.querySelectorAll(selector)) {
    if (getReferenceId(element.getAttribute(attribute)) === id) {
      references.push(adopt(element))
    }
  }

  return new List(references)
}
