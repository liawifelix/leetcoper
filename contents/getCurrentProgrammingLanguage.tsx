import { useMessage } from "@plasmohq/messaging/hook"

function getCurrentProgrammingLanguage() {
  useMessage<string, string>(async (req, res) => {
    if (req.name !== "getCurrentProgrammingLanguage") {
      return
    }
    const editorElement = document.querySelector("#editor")
    const buttonElement = editorElement?.querySelector(
      "button.group.inline-flex"
    )
    const programmingLanguage = buttonElement?.textContent?.trim() || ""

    res.send(programmingLanguage)
  })
}

export default getCurrentProgrammingLanguage
