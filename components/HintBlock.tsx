import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })

const HintBlock = () => {
  const [messages, setMessages] = useState<{ text: string; type: "ai" }[]>([])

  const handleHintClick = async () => {
    const rawData = await storage.get("hintConversation")
    const hintConversation = Array.isArray(rawData) ? rawData : []

    hintConversation.push({
      role: "system",
      content:
        hintConversation.length === 1
          ? "Please return the topics used to solve this problem."
          : "Please provide more hint using the previous hint."
    })

    const response = (
      await sendToBackground({
        name: "conversation",
        body: { conversation: hintConversation }
      })
    )["response"]
    hintConversation.push({ role: "assistant", content: response })

    await storage.set("hintConversation", hintConversation)
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: response, type: "ai" }
    ])
  }

  useEffect(() => {
    const getHintConversation = async () => {
      const rawData = await storage.get("hintConversation")
      const hintConversation = Array.isArray(rawData) ? rawData : []
      setMessages(
        hintConversation
          .filter(({ role }) => role !== "system" && role !== "user")
          .map(({ role, content }) => ({ text: content, type: role }))
      )
    }
    getHintConversation()
  }, [])

  return (
    <div>
      {messages.map((message, index) => (
        <div
          key={index}
          className="mt-2 p-2 bg-green-100 border border-green-500 rounded-md text-green-700">
          {message.text}
        </div>
      ))}
      <button
        className="bg-blue-500 mt-2 text-center text-white py-2 px-4 rounded w-full"
        onClick={handleHintClick}>
        Give me hint
      </button>
    </div>
  )
}

export default HintBlock
