import Router from "express"
let router = Router()
import {
    editorImageUpload,
    contentImageResolution,
    editorVideoUpload,
    contentVideoResolution,
} from "#services/tools.js"
import EditorImage from "#models/EditorImage.js"
import EditorVideo from "#models/EditorVideo.js"
import File from "#models/File.js"
import fs from "fs"

router.get("/get", async (req, res) => {
    let { stage } = req

    stage.execPopulate("files authorUID").then(_stage => {
        let {
            content,
            authorUID,
            editLog,
            files,
            isUsed,
            isPublic,
            sketch,
            status,
            subjectName,
            _id,
            editable,
        } = stage
        let data = {
            content,
            authorUID,
            editLog,
            files,
            isUsed,
            isPublic,
            sketch,
            status,
            subjectName,
            _id,
            editable,
        }

        res.json({
            code: 20000,
            data,
        })
    })
})

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
    stage.allUploadedfiles = [...stage.allUploadedfiles, ...files]
    stage.files = files

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

function processContentSource(stage, content) {
    return new Promise((resolve, reject) => {
        //resolute images
        let imagesID = contentImageResolution(content)
        let videosID = contentVideoResolution(content)
        //对比allUploadedImages,将差集全部isusedFalse，imagesID isused true
        let allUploadedImagesIDSet = stage.allUploadedImages.toString().split(",")
        let allUploadedVideosIDSet = stage.allUploadedVideos.toString().split(",")
        //未使用的images
        let notUsedImagesID = allUploadedImagesIDSet.filter(e => imagesID.indexOf(e) === -1)
        let notUsedVideosID = allUploadedVideosIDSet.filter(e => videosID.indexOf(e) === -1)

        let arrayProcess = []
        for (let e of notUsedImagesID) {
            arrayProcess.push(turnSource(EditorImage, e, false))
        }
        for (let e of imagesID) {
            arrayProcess.push(turnSource(EditorImage, e, true))
        }
        for (let e of notUsedVideosID) {
            arrayProcess.push(turnSource(EditorVideo, e, false))
        }
        for (let e of videosID) {
            arrayProcess.push(turnSource(EditorVideo, e, true))
        }
        Promise.all(arrayProcess)
            .then(() => {
                return resolve({ imagesID, videosID })
            })
            .catch(() => {
                return reject({ message: "资源处理出现错误" })
            })

        function turnSource(model, _id, status) {
            return new Promise((resolve, reject) => {
                model
                    .findById(_id)
                    .select("isUsed")
                    .then((e, err) => {
                        if (err || !e) {
                            return reject(err)
                        }
                        e.isUsed = status
                        e.save(err => {
                            if (err) {
                                return reject(err)
                            }
                            return resolve()
                        })
                    })
            })
        }
    })
}

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

        let allUploadedfiles = stage.allUploadedfiles.toString().split(",")
        let files = stage.files.toString().split(",")
        let notUsedFiles = allUploadedfiles.filter(e => files.indexOf(e) === -1)

        File.find({
            _id: { $in: filesID },
        }).then((files, err) => {
            if (err) {
                return reject({
                    code: 30001,
                    message: "DataBase Error",
                })
            }
            let allSave = []
            files.forEach(f => {
                f.isUsed = true
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