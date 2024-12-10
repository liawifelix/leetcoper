import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/problems/*"],
  run_at: "document_end",
  world: "MAIN"
}

declare global {
  interface Window {
    monaco: any
  }
}

window.addEventListener("message", (message) => {
  if (message.data.action === "update-code") {
    const editorInstance = window.monaco.editor.getModels()[0]
    if (editorInstance) {
      editorInstance.setValue(message.data.code)
    } else {
      console.error("Editor instance not found")
    }
  }
})
