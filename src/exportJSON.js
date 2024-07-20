const consoleSave = require('./util/consoleSave');
const getTimestamp = require('./util/getTimestamp');
const getContents = require('./util/getContents');

(function exportJSON() {
  const chats = []
  const json = {
    meta: {
      exported_at: getTimestamp(),
    },
  };

  const { title, elements } = getContents();
  if (title) {
    json.meta.title = title;
  }

  for (var i = 0; i < elements.length; i++) {
    var ele = elements[i];

    // Prepare object
    var object = {
      index: i,
    };
    var message = [];

    // Get first child
    var firstChild = ele.firstChild;
    if (!firstChild) continue;

    // Element child
    if (firstChild.nodeType === Node.ELEMENT_NODE) {
      var childNodes = firstChild.childNodes;

      // Prefix Claude response label
      if (ele.classList.contains("font-claude-message")) {
        object.type = "response";
      } else {
        object.type = "prompt";
      }

      // Parse child elements
      for (var n = 0; n < childNodes.length; n++) {
        const childNode = childNodes[n];

        if (childNode.nodeType === Node.TEXT_NODE) {
          message.push(firstChild.textContent);
        }
        else if (childNode.nodeType === Node.ELEMENT_NODE) {
          var tag = childNode.tagName;
          var text = childNode.textContent;
          // Paragraphs
          if (tag === "P") {
            message.push({
              type: "p",
              data: text,
            });
          }

          // Get list items
          if (tag === "OL" || tag === "UL") {
            const listItems = [];
            childNode.childNodes.forEach((listItemNode, index) => {
              if (
                listItemNode.nodeType === Node.ELEMENT_NODE &&
                listItemNode.tagName === "LI"
              ) {
                listItems.push({
                  type: "li",
                  data: listItemNode.textContent,
                });
              }
            });

            if (tag === "OL") {
              message.push({
                type: "ol",
                data: listItems,
              });
            }
            if (tag === "UL") {
              message.push({
                type: "ul",
                data: listItems,
              });
            }
          }

          // Code blocks
          if (tag === "PRE") {
            const codeBlockSplit = text.split("Copy code");
            const codeBlockLang = codeBlockSplit[0].trim();
            const codeBlockData = codeBlockSplit[1].trim();

            message.push({
              type: "pre",
              language: codeBlockLang,
              data: codeBlockData,
            });
          }

          // Tables
          if (tag === "TABLE") {
            const tableSections = [];

            // Get table sections
            childNode.childNodes.forEach((tableSectionNode) => {
              if (
                tableSectionNode.nodeType === Node.ELEMENT_NODE &&
                (tableSectionNode.tagName === "THEAD" ||
                  tableSectionNode.tagName === "TBODY")
              ) {
                // Get table rows
                const tableRows = [];
                tableSectionNode.childNodes.forEach(
                  (tableRowNode) => {
                    if (
                      tableRowNode.nodeType === Node.ELEMENT_NODE &&
                      tableRowNode.tagName === "TR"
                    ) {
                      // Get table cells
                      const tableCells = [];
                      tableRowNode.childNodes.forEach(
                        (tableCellNode) => {
                          if (
                            tableCellNode.nodeType ===
                              Node.ELEMENT_NODE &&
                            (tableCellNode.tagName === "TD" ||
                              tableCellNode.tagName === "TH")
                          ) {
                            tableCells.push({
                              type: tableCellNode.tagName.toLowerCase(),
                              data: tableCellNode.textContent,
                            });
                          }
                        }
                      );
                      tableRows.push({
                        type: "tr",
                        data: tableCells,
                      });
                    }
                  }
                );

                tableSections.push({
                  type: tableSectionNode.tagName.toLowerCase(),
                  data: tableRows,
                });
              }
            });

            message.push({
              type: "table",
              data: tableSections,
            });
          }
        }
      }
    }

    // Text child
    if (firstChild.nodeType === Node.TEXT_NODE) {
      // Prefix User prompt label
      object.type = "prompt";
      message.push(firstChild.textContent);
    }

    // Add message data to chats
    object.message = message;
    chats.push(object);
  }

  // Add chats to JSON output
  json.chats = chats;

  // Save to file
  consoleSave(console, "json", title);
  console.save(json);
  return json;
})();
