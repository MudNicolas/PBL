import Router from "express"

import File from "#models/File.js"

import { processContentSource } from "#services/tools/index.js"

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

function processStageFiles(stage, filesID) {
    return new Promise((resolve, reject) => {
        let validate = filesID.every(e => {
            return /^[a-fA-F0-9]{24}$/.test(e)
        })
        if (!validate) {
            return reject({
                code: 32001,
                message: "文件ID错误",
            })
        }

        let allUploadedFiles = stage.allUploadedFiles.map(e => {
            return e.toString()
        })
        let files = stage.files.map(e => {
            return e.toString()
        })
        let notUsedFiles = allUploadedFiles.filter(e => files.indexOf(e) === -1)

        File.find({
            _id: { $in: filesID },
            isNeeded: false,
        }).then((files, err) => {
            if (err) {
                return reject({
                    code: 30001,
                    message: "DataBase Error",
                })
            }
            let allSave = []
            files.forEach(f => {
                f.isNeeded = true
                allSave.push(
                    new Promise((resolve, reject) => {
                        f.save(err => {
                            if (err) {
                                return reject(err)
                            }
                            resolve()
                        })
                    })
                )
            })
            Promise.all(allSave)
                .then(() => {
                    resolve()
                })
                .catch(() => {
                    reject({
                        code: 30001,
                        message: "DataBase Error",
                    })
                })
        })

        File.find({
            _id: { $in: notUsedFiles },
            isNeeded: true,
        }).then(files => {
            files.forEach(f => {
                f.isNeeded = false
                f.save(err => {
                    if (err) {
                        console.log(err)
                    }
                })
            })
        })
    })
}

export default router
