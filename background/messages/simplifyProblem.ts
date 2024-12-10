import { JsonOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { ChatOpenAI } from "@langchain/openai"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })

interface Example {
  input: string
  explanation: string
  output: string
}

interface SimplifiedProblem {
  description: string
  examples: Array<Example>
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { problem } = req.body

    const mainPrompt = `You are an expert in explaining leetcode problems. Given a leetcode problem description, please simplify the question description and provide a total of 3 examples, ensuring each example contains a clear explanation.`

    const formatInstructions =
      "Respond with a valid JSON object, containing two fields: 'description' and 'examples'."

    const parser = new JsonOutputParser<SimplifiedProblem>()

    const prompt = ChatPromptTemplate.fromTemplate(
      "{formatInstruction}\n{simplifiedProblemPrompt}\nOriginal problem below:\n{originalProblem}\n"
    )

    const partialPrompt = await prompt.partial({
      formatInstruction: formatInstructions,
      simplifiedProblemPrompt: mainPrompt
    })

    const model = new ChatOpenAI({
      model: await storage.get("LLM"),
      apiKey: await storage.get("openai_key")
    })

    const chain = partialPrompt.pipe(model).pipe(parser)

    const result = await chain.invoke({ originalProblem: problem })

    res.send({ simplifiedProblem: result })
  } catch (error) {
    res.send({ error: error.message })
  }
}

export default handler
