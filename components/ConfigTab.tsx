import OpenAI from "openai"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

const storage = new Storage({ area: "local" })

const ConfigTab = () => {
  const [openAIKey, setOpenAIKey] = useState("")

  useEffect(() => {
    const getOpenAIKey = async () => {
      const openai_key = await storage.get("openai_key")
      setOpenAIKey(openai_key)
    }
    getOpenAIKey()
  }, [])

  const [
    LLM,
    setLLM,
    { setStoreValue: setLLMValue, setRenderValue: setLLMRenderValue }
  ] = useStorage({ key: "LLM", instance: new Storage({ area: "local" }) })

  const [
    openAIKeyIsValid,
    setOpenAIKeyIsValid,
    {
      setStoreValue: setOpenAIKeyIsValidValue,
      setRenderValue: setOpenAIKeyIsValidRenderValue
    }
  ] = useStorage({
    key: "openAIKeyIsValid",
    instance: new Storage({ area: "local" })
  })

  const isOpenAIKeyIsValid = async (key: string) => {
    const client = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true })
    try {
      await client.models.list()
      await storage.set("openAIKeyIsValid", true)
      return true
    } catch {
      await storage.set("openAIKeyIsValid", false)
      return false
    }
  }

  const handleSetOpenAIKey = async () => {
    const isValid = await isOpenAIKeyIsValid(openAIKey)

    if (isValid) await storage.set("openai_key", openAIKey)
  }

  return (
    <div className="p-4 text-left text-gray-800">
      <div className="mb-4">
        <label
          htmlFor="openAIKey"
          className="block text-sm font-medium text-gray-700">
          OpenAI Key {openAIKeyIsValid ? "✅" : "❌"}
        </label>
        <div className="flex items-center">
          <input
            type="text"
            id="openAIKey"
            value={openAIKey}
            onChange={(e) => setOpenAIKey(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            onClick={handleSetOpenAIKey}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Set
          </button>
        </div>
      </div>
      <div>
        <label
          htmlFor="model-select"
          className="block text-sm font-medium text-gray-700">
          Select Model:
        </label>
        <div className="flex items-center">
          <select
            id="model-select"
            value={LLM}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setLLMRenderValue(e.target.value)}>
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4o-mini">GPT-4o-mini</option>
          </select>
          <button
            onClick={() => setLLMValue()}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Set
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfigTab
