import Router from "express"
let router = Router()
import { editorImageUpload, contentImageResolution } from "#services/tools.js"
import EditorImage from "#models/EditorImage.js"

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
                    link: r.link,
                    imageID: r.imageID,
                })
            })
        })
        .catch(err => {
            res.json(err)
        })
})

router.post("/editor/autosave", (req, res) => {
    let { content } = req.body
    let { project, stageID } = req
    let index = project.stages.findIndex(s => s._id.toString() === stageID.toString())
    //save content
    project.stages[index].content = content
    //save log
    project.stages[index].editLog.push({
        uid: req.uid,
        time: new Date(),
        operation: "自动保存",
    })

    //resolute images
    let imagesID = contentImageResolution(content)
    //对比allUploadedImages,将差集全部isusedFalse，imagesID isused true
    let stage = project.stages[index]
    let allUplodedImagesIDSet = stage.allUploadedImages.toString().split(",")
    //未使用的images
    let notUsedImagesID = allUplodedImagesIDSet.filter(e => imagesID.indexOf(e) === -1)

    let arrayProcess = []
    for (let e of notUsedImagesID) {
        arrayProcess.push(turnImage(e, false))
    }
    for (let e of imagesID) {
        arrayProcess.push(turnImage(e, true))
    }
    Promise.all(arrayProcess).then(() => {
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
            })
        })
    })

    function turnImage(_id, status) {
        return new Promise((resolve, reject) => {
            EditorImage.findById(_id)
                .select("isUsed")
                .then((image, err) => {
                    if (err || !image) {
                        return reject(err)
                    }
                    image.isUsed = status
                    image.save(err => {
                        if (err) {
                            return reject(err)
                        }
                        return resolve()
                    })
                })
        })
    }
})

export default router
