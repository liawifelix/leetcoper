import { useMessage } from "@plasmohq/messaging/hook"

function getCurrentCode() {
  useMessage<string, string>(async (req, res) => {
    if (req.name !== "getCurrentCode") {
      return
    }
    const codeElement = document.querySelector(
      "div.lines-content.monaco-editor-background"
    )
    const currentCode = codeElement?.textContent?.trim() || ""
    res.send(currentCode)
  })
}

export default getCurrentCode
