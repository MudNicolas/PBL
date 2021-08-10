import Router from "express"
let router = Router()
import { editorImageUpload } from "#services/tools.js"

router.get("/get", (req, res) => {
    let { project, stageID } = req
    let stage = project.stages.find(s => s._id.toString() === stageID.toString())

    res.json({
        code: 20000,
        data: stage,
    })
})

router.post("/editor/image/upload", (req, res) => {
    editorImageUpload(req)
        .then(r => {
            let { project, stageID } = req
            let index = project.stages.findIndex(s => s._id.toString() === stageID.toString())
            project.stages[index].allUploadedImages.push(r.imageID)
            project.save(err => {
                if (err) {
                    res.json({
                        code: 300001,
                        message: "DataBase Error",
                    })
                    return
                }
                res.json({
                    code: 20000,
                    link: r.link,
                })
            })
        })
        .catch(err => {
            res.json(err)
        })
})

export default router
