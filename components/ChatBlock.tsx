import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })

const ChatBlock = () => {
  const [messages, setMessages] = useState<
    { text: string; type: "user" | "ai" }[]
  >([])
  const [input, setInput] = useState("")

  useEffect(() => {
    const getProblemDescriptionConversation = async () => {
      const rawData = await storage.get("problemDescriptionConversation")
      const problemDescriptionConversation = Array.isArray(rawData)
        ? rawData
        : []
      setMessages(
        problemDescriptionConversation
          .filter(({ role }) => role !== "system")
          .map(({ role, content }) => ({
            text: content,
            type: role === "user" ? "user" : "ai"
          }))
      )
    }
    getProblemDescriptionConversation()
  }, [])

  const handleSend = async () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, type: "user" }])
      setInput("")

      const rawData = await storage.get("problemDescriptionConversation")
      const problemDescriptionConversation = Array.isArray(rawData)
        ? rawData
        : []
      problemDescriptionConversation.push({ role: "user", content: input })

      const response = (
        await sendToBackground({
          name: "conversation",
          body: { conversation: problemDescriptionConversation }
        })
      )["response"]
      problemDescriptionConversation.push({
        role: "assistant",
        content: response
      })

      await storage.set(
        "problemDescriptionConversation",
        problemDescriptionConversation
      )
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: response, type: "ai" }
      ])
    }
  }

  return (
    <div className="mt-4">
      <div className="border p-2 rounded h-80 overflow-y-auto bg-gray-100">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 mb-2 rounded shadow-sm ${message.type === "user" ? "bg-blue-100" : "bg-green-100"}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="mt-2 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatBlock
