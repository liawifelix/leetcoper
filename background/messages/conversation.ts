import OpenAI from "openai"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const storage = new Storage({
  area: "local"
})

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { conversation } = req.body

    const apiKey = await storage.get("openai_key")
    const model = await storage.get("LLM")

    const openai = new OpenAI({ apiKey })

    const completion = await openai.chat.completions.create({
      model: model,
      messages: conversation
    })

    res.send({ response: completion.choices[0].message.content })
  } catch (error) {
    res.send({ error: error.message })
  }
}

export default handler
