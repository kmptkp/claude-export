// parsing helpers

function ol_number(ol_node, li_node) {
  const start = ol_node.getAttribute('start') || '1'
  const index = li_node.getAttribute('index') || '0'
  return Number.parseInt(start) + Number.parseInt(index)
}

module.exports = {ol_number, }