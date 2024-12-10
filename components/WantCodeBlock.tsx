import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

const storage = new Storage({ area: "local" })

const WantCodeBlock = () => {
  const [code] = useStorage({
    key: "code",
    instance: new Storage({ area: "local" })
  })

  const handleGetCode = async () => {
    const problemDescription = await storage.get("problemDescription")
    const currentCode = await sendToContentScript({ name: "getCurrentCode" })
    const programmingLanguage = await sendToContentScript({
      name: "getCurrentProgrammingLanguage"
    })

    const code = (
      await sendToBackground({
        name: "getCode",
        body: { problem: problemDescription, programmingLanguage, currentCode }
      })
    )["code"]
    await storage.set("code", code)
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(code["code"])
  }

  const handlePasteCodeToEditor = async () => {
    await sendToContentScript({
      name: "setCode",
      body: { code: await storage.get("code") }
    })
  }

  return (
    <div>
      {!code ? (
        <button
          className="bg-red-500 text-center text-white mt-2 py-2 px-4 rounded w-full"
          onClick={handleGetCode}>
          I want the code 😅
        </button>
      ) : (
        <>
          <button
            className="bg-red-500 text-center text-white mt-2 py-2 px-4 rounded w-full"
            onClick={copyCode}>
            Copy code
          </button>
          <button
            className="bg-red-500 text-center text-white mt-2 py-2 px-4 rounded w-full"
            onClick={handlePasteCodeToEditor}>
            Paste to editor
          </button>
        </>
      )}
    </div>
  )
}

export default WantCodeBlock
