// parsing helpers

function parse_ol(ol_node) {
  const items = []
  let lastText, i
  let start = ol_node.getAttribute('start')
  if (start) {
    start = Number.parseInt(start)
  } else {
    i = 0
  }
  ol_node.childNodes.forEach((listItemNode) => {
    if (listItemNode.nodeType === Node.ELEMENT_NODE && listItemNode.tagName === "LI") {
      if (start) {
        const index = listItemNode.getAttribute('index') || '0'
        i = start + Number.parseInt(index)
      } else {
        i++
      }
      // console.log('ol.li', index, listItemNode.textContent, ol_node)
      lastText = listItemNode.textContent
      items.push([i, lastText])
    } else if (listItemNode.nodeType !== Node.TEXT_NODE || listItemNode.textContent != "\n") {
      console.log(listItemNode)
      throw new Error(' *** non LI non TEXT node in OL', listItemNode.innerHTML)
    }
  })
  return items
}

module.exports = {parse_ol}