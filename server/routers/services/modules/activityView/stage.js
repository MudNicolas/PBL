import Router from "express"
let router = Router()
import { editorImageUpload, editorVideoUpload, processContentSource } from "#services/tools.js"
import File from "#models/File.js"
import Approvement from "#models/Approvement.js"
import manage from "./stageManage.js"

router.get("/get", (req, res) => {
    let { stage, activity } = req

    stage
        .execPopulate([
            { path: "authorUID", select: "name avatar" },
            { path: "files", select: "originalFilename size" },
        ])
        .then(async _stage => {
            let {
                content,
                authorUID,
                files,
                isUsed,
                isPublic,
                sketch,
                status,
                subjectName,
                _id,
                editable,
                isSaved,
            } = _stage

            files = files.map(e => {
                return {
                    name: e.originalFilename,
                    response: { _id: e._id },
                    size: e.size,
                }
            })

            let data = {
                content,
                authorUID,
                files,
                isUsed,
                isPublic,
                sketch,
                status,
                subjectName,
                _id,
                editable,
                isSaved,
            }

            if (activity.options.isTimeLimited) {
                let limitTime = activity.options.limitTime
                if (new Date() < new Date(limitTime[0]) || new Date() > new Date(limitTime[1])) {
                    data.timeout = true
                }
            }

            data.approvement = await Approvement.findOne({ stageID: _id })
                .select("time approver status reason")
                .populate({ path: "approver", select: "name" })
                .exec()

            res.json({
                code: 20000,
                data,
            })
        })
})

router.use("/manage", manage)

router.use((req, res, next) => {
    let { stage } = req
    let { editable } = stage
    if (!editable) {
        res.json({
            message: "该阶段已不可编辑",
        })
        return
    }
    next()
})

router.post("/editor/image/upload", (req, res) => {
    editorImageUpload(req)
        .then(r => {
            let { stage } = req
            stage.allUploadedImages.push(r.imageID)
            stage.save(err => {
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

router.post("/editor/video/upload", (req, res) => {
    editorVideoUpload(req)
        .then(r => {
            let { stage } = req
            stage.allUploadedVideos.push(r.videoID)
            stage.save(err => {
                if (err) {
                    res.json({
                        code: 300001,
                        message: "DataBase Error",
                    })
                    return
                }
                res.json({
                    link: r.link,
                    videoID: r.videoID,
                })
            })
        })
        .catch(err => {
            res.json(err)
        })
})

router.post("/editor/autosave", (req, res) => {
    let { content } = req.body
    let { stage } = req
    //save content
    stage.content = content
    processContentSource(stage, content)
        .then(d => {
            let { imagesID, videosID } = d
            stage.images = imagesID
            stage.videos = videosID
            stage.save(err => {
                if (err) {
                    res.json({ message: "DataBase Error" })
                }
                res.json({ code: 20000 })
            })
        })
        .catch(err => {
            console.log(err)
            res.json({
                message: err.message,
            })
        })
})

router.post("/save", (req, res) => {
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
