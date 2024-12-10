import { JsonOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { ChatOpenAI } from "@langchain/openai"

import { type PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })

interface Code {
  code: string
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { problem, programmingLanguage, currentCode } = req.body

    const mainPrompt = `You are an expert in solving coding problems. Please provide the formatted solution for the given problem in ${programmingLanguage}. The current code is provided below:

${currentCode}

Ensure the solution is correct and follows best practices for the ${programmingLanguage} language.`

    const formatInstructions =
      "Respond with a valid JSON object, containing one field: 'code'."

    const parser = new JsonOutputParser<Code>()

    const prompt = ChatPromptTemplate.fromTemplate(
      "{formatInstruction}\n{solveProblem}\nOriginal problem below:\n{originalProblem}\n"
    )

    const partialPrompt = await prompt.partial({
      formatInstruction: formatInstructions,
      solveProblem: mainPrompt
    })

    const model = new ChatOpenAI({
      model: await storage.get("LLM"),
      apiKey: await storage.get("openai_key")
    })

    const chain = partialPrompt.pipe(model).pipe(parser)

    const result = await chain.invoke({ originalProblem: problem })

    res.send({ code: result })
  } catch (error) {
    res.send({ error: error.message })
  }
}

export default handler
