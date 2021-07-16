import Router from "express"
let router = Router()
import { UploadFiles } from "#services/tools.js"

router.post("/upload", (req, res) => {
    UploadFiles(req)
        .then(data => console.log(data))
        .catch()
})

export default router
