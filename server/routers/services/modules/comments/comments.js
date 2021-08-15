import Router from "express"
let router = Router()

import Comment from "#models/Comment.js"
import {
    editorImageUpload,
    contentImageResolution,
    editorVideoUpload,
    contentVideoResolution,
} from "#services/tools.js"

router.get("/get", (req, res) => {
    let { stageID, type } = req.query

    let comments = Comment.find({
        activityContentID: stageID,
        type,
        isSubmit: true,
    })
        .select("commentUser comment time reply")
        .populate([
            { path: "commentUer", select: "name avatar" },
            { path: "reply.from", select: "name avatar" },
            { path: "reply.to", select: "name avatar" },
        ])
        .exec()

    let tempSaveComment = Comment.findOne({
        activityContentID: stageID,
        type,
        isSubmit: false,
        commentUser: req.uid,
    })
        .select("comment")
        .exec()

    Promise.all([comments, tempSaveComment]).then(async e => {
        let comm = e[0]
        let temp = e[1]
        if (!temp) {
            temp = await new Comment({
                activityContentID: stageID,
                commentUser: req.uid,
                type,
            })
                .save()
                .then(t => {
                    return {
                        comment: t.comment,
                        _id: t._id,
                    }
                })
        }

        res.json({
            code: 20000,
            data: {
                comments: comm,
                tempComm: temp,
            },
        })
    })
})

router.use((req, res, next) => {
    let commentID = req.body.commentID || req.query.commentID
    let validate = /^[a-fA-F0-9]{24}$/.test(commentID)
    if (!validate) {
        res.json({
            code: 404,
        })
        return
    }

    Comment.findById(commentID).then(c => {
        req.comment = c
        next()
    })
})

router.post("/editor/autosave", (req, res) => {
    let { entry, content, commentID } = req.body
    console.log(entry, content, commentID)
    let { comment } = req

    let index = comment.comment.findIndex(e => e.entry === entry)
    comment.comment[index].content = content
    comment.save(err => {
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

router.post("/editor/image/upload", (req, res) => {
    editorImageUpload(req)
        .then(r => {
            let { comment } = req
            comment.allUploadedImages.push(r.imageID)
            comment.save(err => {
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
            let { comment } = req
            comment.allUploadedVideos.push(r.videoID)
            comment.save(err => {
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
