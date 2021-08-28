import Router from "express"

import { editorImageUpload, editorVideoUpload } from "#services/tools/index.js"

let router = Router()

router.post("/autosave", (req, res) => {
    let { entry, content } = req.body
    let { commentData } = req

    if (commentData.isSubmit) {
        res.json({
            message: "已提交",
        })
        return
    }
    let index = commentData.comment.findIndex(e => e.entry === entry)
    if (index > -1) {
        commentData.comment[index].content = content
    } else {
        commentData.comment.push({ entry, content })
    }

    commentData.save(err => {
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

router.post("/image/upload", (req, res) => {
    editorImageUpload(req)
        .then(r => {
            let { commentData } = req
            commentData.allUploadedImages.push(r.imageID)
            commentData.save(err => {
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
            let { commentData } = req
            commentData.allUploadedVideos.push(r.videoID)
            commentData.save(err => {
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

export default router
