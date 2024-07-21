const consoleSave = require("./util/consoleSave");
const getTimestamp = require("./util/getTimestamp");
const getContents = require("./util/getContents");
const { parse_ol } = require("./util/parse");

function mdFromCopyButton(el, md) {
  return md
}

function mdFromDOM(topEl, md) {
  // Parse child elements
  contentNodes = topEl.childNodes
  for (var n = 0; n < contentNodes.length; n++) {
    const childNode = contentNodes[n];

    if (childNode.nodeType === Node.TEXT_NODE) {
      md += `${childNode.textContent}\n`;
    }
    else if (childNode.nodeType === Node.ELEMENT_NODE) {
      var tag = childNode.tagName;
      var text = childNode.textContent;
      // Paragraphs
      if (tag === "P") {
        md += `${text}\n`;
      }

      // Get list items
      if (tag === "OL") {
        for (const [liNum, olText] of parse_ol(childNode)) {
          md += `${liNum}. ${olText}\n`;
        }
      }
      if (tag === "UL") {
        childNode.childNodes.forEach((listItemNode, index) => {
          if (
            listItemNode.nodeType === Node.ELEMENT_NODE &&
            listItemNode.tagName === "LI"
          ) {
            md += `- ${listItemNode.textContent}\n`;
          }
        });
      }

      // Code blocks
      if (tag === "PRE") {
        preChildren = childNode.childNodes.length == 1 ? childNode.childNodes[0].childNodes : childNode.childNodes
        const codeBlockLang = preChildren[0].textContent.trim();
        const codeBlockData = preChildren[2].textContent.trim();
        md += `\`\`\`${codeBlockLang}\n${codeBlockData}\n\`\`\`\n`;
      }

      // Quotes
      if (tag === "BLOCKQUOTE") {
        for (const line of text.trim().split("\n")) {
          md += `> ${line}\n`;
        }
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
        md += tableMarkdown;
      }

      // Paragraph break after each element
      md += "\n";
    }
  }
  return md
}

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

    // Text child
    if (firstChild.nodeType === Node.TEXT_NODE) {
      // End of prompt paragraphs breaks
      markdown += "\n";
      continue
    }
    
    // Claude reponses have a different DOM structure than prompts
    if (ele.classList.contains("font-claude-message")) {
      markdown += `## Claude:\n`;
      if (firstChild.tagName == 'DIV' && firstChild.childNodes.length == 1 && !!firstChild.classList) {
        firstChild = firstChild.firstChild
      }
      markdown = mdFromDOM(firstChild, markdown)
    } else {
      markdown += `## Me:\n`;
      markdown = mdFromDOM(ele, markdown)
    }
  }

  // Save to file
  consoleSave(console, "md", title);
  console.save(markdown);
  return markdown;
})();
