import { useMessage } from "@plasmohq/messaging/hook"

function setCode() {
  useMessage<{ code: { code: string } }, string>(async (req, res) => {
    if (req.name != "setCode") {
      return
    }
    window.postMessage({
      action: "update-code",
      code: req.body.code.code
    })

    res.send("Code updated")
  })
}

export default setCode
