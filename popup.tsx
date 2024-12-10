import "./style.css"

import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import ChatBlock from "./components/ChatBlock"
import ConfigTab from "./components/ConfigTab"
import HintBlock from "./components/HintBlock"
import WantCodeBlock from "./components/WantCodeBlock"

const IndexPopup = () => {
  const [activeTab, setActiveTab] = useState("tab1")
  const [
    openAIKeyIsValid,
    setOpenAIKeyIsValid,
    { isLoading: openAIKeyIsValidIsLoading }
  ] = useStorage({
    key: "openAIKeyIsValid",
    instance: new Storage({ area: "local" })
  })

  useEffect(() => {
    setActiveTab(openAIKeyIsValid ? "tab1" : "tab3")
  }, [openAIKeyIsValidIsLoading, openAIKeyIsValid])

  const [problemTitle] = useStorage({
    key: "problemTitle",
    instance: new Storage({ area: "local" })
  })
  const [
    simplifiedProblemDescription,
    _,
    { isLoading: simplifiedProblemDescriptionIsLoading }
  ] = useStorage({
    key: "simplifiedProblemDescription",
    instance: new Storage({ area: "local" })
  })

  const tabNames = {
    tab1: "Question Helper",
    tab2: "Hint Code",
    tab3: "Configuration"
  }

  const renderTabContent = () => {
    if (!openAIKeyIsValid) return <ConfigTab />
    if (activeTab === "tab1") {
      return (
        <div className="p-3 text-gray-800">
          <p className="text-lg font-bold mb-2">{problemTitle}</p>
          <div className="bg-white p-2 rounded-md shadow">
            <p className="text-sm font-bold text-gray-700">Description:</p>
            {simplifiedProblemDescription ? (
              <>
                <p className="text-gray-600 mb-2">
                  {simplifiedProblemDescription.description}
                </p>
                {simplifiedProblemDescription.examples.map((example, index) => (
                  <div className="text-gray-600 mt-2" key={index}>
                    <p className="font-bold">Example {index + 1}:</p>
                    <span>Input: </span>
                    <span className="bg-gray-100 px-1 py-0.5 rounded">
                      {JSON.stringify(example.input)}
                    </span>
                    <br />
                    <span>Output: </span>
                    <span className="bg-gray-100 px-1 py-0.5 rounded">
                      {JSON.stringify(example.output)}
                    </span>
                    <br />
                    <span>Explanation: </span>
                    {example.explanation}
                  </div>
                ))}
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>
          {simplifiedProblemDescription && <ChatBlock />}
        </div>
      )
    }
    if (activeTab === "tab2") {
      return (
        <div className="p-4 text-gray-800">
          {simplifiedProblemDescription ? (
            <>
              <HintBlock />
              <WantCodeBlock />
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      )
    }
    if (activeTab === "tab3") return <ConfigTab />
    return null
  }

  return (
    <div className="w-80 border rounded-lg shadow-lg font-sans bg-white text-gray-800">
      <div className="flex bg-gray-100 border-b">
        {Object.keys(tabNames).map((tab) => (
          <div
            key={tab}
            className={`flex-1 text-center py-2 cursor-pointer font-bold ${activeTab === tab ? "bg-blue-500 text-white border-b-2 border-blue-500" : "text-gray-600 hover:bg-gray-200"}`}
            onClick={() => openAIKeyIsValid && setActiveTab(tab)}>
            {tabNames[tab]}
          </div>
        ))}
      </div>
      {renderTabContent()}
    </div>
  )
}

export default IndexPopup
