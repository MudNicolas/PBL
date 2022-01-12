import Router from "express"

import { processContentSource, processStageFiles } from "#services/tools/index.js"

let router = Router()

router.post("/", (req, res) => {
    let { stageData } = req.body
    let { subjectName, sketch, content, files } = stageData
    let { stage } = req

    stage.subjectName = subjectName
    stage.content = content
    stage.sketch = sketch
    stage.allUploadedFiles = [...stage.allUploadedFiles, ...files]
    stage.files = files
    stage.editLog.push({
        uid: req.uid,
        time: new Date(),
        operation: "编辑保存",
    })
    stage.isSaved = true

    processContentSource(stage, content)
        .then(d => {
            let { imagesID, videosID } = d
            stage.images = imagesID
            stage.videos = videosID

            processStageFiles(stage, files).then(() => {
                stage.save(err => {
                    if (err) {
                        return
                    }
                    res.json({
                        code: 20000,
                    })
                })
            })
        })
        .catch(err => {
            console.log(err)
            res.json(err)
        })
})

export default router
