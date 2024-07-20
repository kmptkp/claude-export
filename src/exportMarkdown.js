const consoleSave = require("./util/consoleSave");
const getTimestamp = require("./util/getTimestamp");
const getContents = require("./util/getContents");

(function exportMarkdown() {
  var markdown = "";
  // var elements = document.querySelectorAll("[class*='min-h-[20px]']");

  const { elements, title } = getContents();

  var timestamp = getTimestamp();
  markdown += `\# ${title || "Claude Chat"}\n\`${timestamp}\`\n\n`;

  for (var i = 0; i < elements.length; i++) {
    var ele = elements[i];

    // Get first child
    var firstChild = ele.firstChild;
    if (!firstChild) continue;

    if (firstChild.tagName == 'DIV' && firstChild.childNodes.length == 1 && !!firstChild.classList) {
      firstChild = firstChild.firstChild
    }

    // Element child
    if (firstChild.nodeType === Node.ELEMENT_NODE) {
      var childNodes = firstChild.childNodes;

      // Prefix Claude reponse label
      if (ele.classList.contains("font-claude-message")) {
        markdown += `_Claude_:\n`;
      } else {
        markdown += `_Prompt_:\n`;
      }

      // Parse child elements
      for (var n = 0; n < childNodes.length; n++) {
        const childNode = childNodes[n];

        if (childNode.nodeType === Node.TEXT_NODE) {
          markdown += `${childNode.textContent}\n`;
        }
        else if (childNode.nodeType === Node.ELEMENT_NODE) {
          var tag = childNode.tagName;
          var text = childNode.textContent;
          // Paragraphs
          if (tag === "P") {
            markdown += `${text}\n`;
          }

          // Get list items
          if (tag === "OL") {
            childNode.childNodes.forEach((listItemNode, index) => {
              if (
                listItemNode.nodeType === Node.ELEMENT_NODE &&
                listItemNode.tagName === "LI"
              ) {
                markdown += `${index + 1}. ${
                  listItemNode.textContent
                }\n`;
              }
            });
          }
          if (tag === "UL") {
            childNode.childNodes.forEach((listItemNode, index) => {
              if (
                listItemNode.nodeType === Node.ELEMENT_NODE &&
                listItemNode.tagName === "LI"
              ) {
                markdown += `- ${listItemNode.textContent}\n`;
              }
            });
          }

          // Code blocks
          if (tag === "PRE") {
            preChildren = childNode.childNodes.length == 1 ? childNode.childNodes[0].childNodes : childNode.childNodes
            const codeBlockLang = preChildren[0].textContent.trim();
            const codeBlockData = preChildren[2].textContent.trim();
            markdown += `\`\`\`${codeBlockLang}\n${codeBlockData}\n\`\`\`\n`;
          }

          // Tables
          if (tag === "TABLE") {
            // Get table sections
            let tableMarkdown = "";
            childNode.childNodes.forEach((tableSectionNode) => {
              if (
                tableSectionNode.nodeType === Node.ELEMENT_NODE &&
                (tableSectionNode.tagName === "THEAD" ||
                  tableSectionNode.tagName === "TBODY")
              ) {
                // Get table rows
                let tableRows = "";
                let tableColCount = 0;
                tableSectionNode.childNodes.forEach(
                  (tableRowNode) => {
                    if (
                      tableRowNode.nodeType === Node.ELEMENT_NODE &&
                      tableRowNode.tagName === "TR"
                    ) {
                      // Get table cells
                      let tableCells = "";

                      tableRowNode.childNodes.forEach(
                        (tableCellNode) => {
                          if (
                            tableCellNode.nodeType ===
                              Node.ELEMENT_NODE &&
                            (tableCellNode.tagName === "TD" ||
                              tableCellNode.tagName === "TH")
                          ) {
                            tableCells += `| ${tableCellNode.textContent} `;
                            if (
                              tableSectionNode.tagName === "THEAD"
                            ) {
                              tableColCount++;
                            }
                          }
                        }
                      );
                      tableRows += `${tableCells}|\n`;
                    }
                  }
                );

                tableMarkdown += tableRows;

                if (tableSectionNode.tagName === "THEAD") {
                  const headerRowDivider = `| ${Array(tableColCount)
                    .fill("---")
                    .join(" | ")} |\n`;
                  tableMarkdown += headerRowDivider;
                }
              }
            });
            markdown += tableMarkdown;
          }

          // Paragraph break after each element
          markdown += "\n";
        }
      }
    }

    // Text child
    if (firstChild.nodeType === Node.TEXT_NODE) {
      // Prefix User prompt label
      // markdown += `_Prompt_: \n`;
      // markdown += `${firstChild.textContent}\n`;

      // End of prompt paragraphs breaks
      markdown += "\n";
    }
  }

  // Save to file
  consoleSave(console, "md", title);
  console.save(markdown);
  return markdown;
})();
