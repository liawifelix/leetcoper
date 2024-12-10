import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/problems/*"],
  run_at: "document_end"
}

function getElementTextContent(selector: string): string {
  const element = document.querySelector(selector)
  if (element && element.textContent) {
    return element.textContent.trim()
  }
  throw new Error("Failed to retrieve text content")
}

const storage = new Storage({ area: "local" })

async function resetProblemDetails() {
  await storage.set("problemTitle", "")
  await storage.set("problemDescription", "")
  await storage.set("simplifiedProblemDescription", "")
  await storage.set("problemDescriptionConversation", [])
  await storage.set("hintConversation", [])
  await storage.set("code", "")

  const llm = await storage.get("LLM")
  if (!llm) {
    await storage.set("LLM", "gpt-4o-mini")
  }
}

async function fetchAndStoreProblemDetails() {
  try {
    const problemTitle = getElementTextContent(".text-title-large a")
      .split(".")[1]
      .trim()
    const problemDescription = getElementTextContent(
      'div[data-track-load="description_content"]'
    )

    const storedProblemTitle = await storage.get("problemTitle")
    const storedSimplifiedProblemDescription = await storage.get(
      "simplifiedProblemDescription"
    )

    if (
      storedProblemTitle === problemTitle &&
      storedSimplifiedProblemDescription
    ) {
      return
    }

    resetProblemDetails()

    await storage.set("problemTitle", problemTitle)
    await storage.set("problemDescription", problemDescription)

    const { simplifiedProblem } = await sendToBackground({
      name: "simplifyProblem",
      body: { problem: problemDescription }
    })

    await storage.set("simplifiedProblemDescription", simplifiedProblem)

    const problemDescriptionConversation = [
      {
        role: "system",
        content: `You are a great assistant in helping users understand leetcode problems. The title is ${problemTitle} and the problem is ${JSON.stringify(simplifiedProblem)}. Please only explain the problem and examples. Do not provide any code or pseudocode. Reply in a concise and clear way.`
      }
    ]

    const hintConversation = [
      {
        role: "system",
        content: `You are a great assistant in giving hints for leetcode problems. The title is ${problemTitle} and the problem is ${JSON.stringify(simplifiedProblem)}. Please only give hints. Start hinting from the easiest level. Do not provide any code or pseudocode. Reply in a concise and clear way.`
      }
    ]

    await storage.set(
      "problemDescriptionConversation",
      problemDescriptionConversation
    )
    await storage.set("hintConversation", hintConversation)
  } catch (error) {
    console.error("Error fetching and storing problem details:", error)
  }
}

setInterval(fetchAndStoreProblemDetails, 3000)
