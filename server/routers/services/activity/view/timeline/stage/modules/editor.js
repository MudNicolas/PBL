import Router from "express"
let router = Router()
import {
    editorImageUpload,
    editorVideoUpload,
    processContentSource,
} from "#services/tools/index.js"

router.post("/image/upload", (req, res) => {
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

router.post("/video/upload", (req, res) => {
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

router.post("/autosave", (req, res) => {
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

export default router
