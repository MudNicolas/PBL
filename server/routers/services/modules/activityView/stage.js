import Router from "express"
let router = Router()
import { editorImageUpload } from "#services/tools.js"

router.get("/get", (req, res) => {
    let { stage } = req

    res.json({
        code: 20000,
        data: stage,
    })
})

router.post("/editor/image/upload", (req, res) => {
    editorImageUpload(req)
        .then(r => {
            res.json(r)
        })
        .catch(err => {
            res.json(err)
        })
})

export default router
