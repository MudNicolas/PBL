import Router from "express"
let router = Router()

import Comment from "#models/Comment.js"
import { editorImageUpload, editorVideoUpload, processContentSource } from "#services/tools.js"

router.get("/get", (req, res) => {
    let { stageID, type } = req.query

    let comments = Comment.find({
        activityContentID: stageID,
        type,
        isSubmit: true,
        isUsed: true,
    })
        .select({ commentUser: 1, comment: 1, time: 1, reply: 1 })
        .populate([
            { path: "commentUser", select: "name avatar" },
            { path: "reply.fromUser", select: "name avatar" },
            { path: "reply.toUser", select: "name avatar" },
        ])
        .sort({ time: 1 })
        .then(c => {
            return c.map(e => {
                return {
                    _id: e._id,
                    commentUser: e.commentUser,
                    comment: e.comment,
                    time: e.time,
                    reply: e.reply.filter(r => r.isUsed),
                }
            })
        })

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

//验证comment是否存在
router.use((req, res, next) => {
    let commentID = req.body.commentID || req.query.commentID
    let validate = /^[a-fA-F0-9]{24}$/.test(commentID)
    if (!validate) {
        res.json({
            message: "该评论不存在",
        })
        return
    }

    Comment.findOne({
        _id: commentID,
        isUsed: true,
    }).then(c => {
        if (!c) {
            return res.json({
                message: "该评论不存在或已被移除",
            })
        }
        req.commentData = c
        next()
    })
})

router.post("/reply/submit", (req, res) => {
    let { reply, replyID } = req.body
    let { commentData } = req
    let toUser = commentData.commentUser
    if (replyID) {
        let t = commentData.reply.find(r => r._id.toString() === replyID.toString())
        if (t) toUser = t.fromUser
    }
    commentData.reply.push({
        fromUser: req.uid,
        toUser,
        toReply: replyID,
        content: reply,
        time: new Date(),
    })
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

router.post("/reply/remove", (req, res) => {
    let { replyID } = req.body
    let { commentData, course } = req
    let index = commentData.reply.findIndex(e => e._id.toString() === replyID.toString())
    let reply = commentData.reply[index]
    let { chiefTeacher, partnerTeacher } = course
    if (
        reply.fromUser.toString() !== req.uid &&
        chiefTeacher.toString() !== req.uid &&
        !partnerTeacher.find(e => e.toString() === req.uid)
    ) {
        res.json({
            code: 401,
        })
        return
    }
    commentData.reply[index].isUsed = false
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

router.use((req, res, next) => {
    let { commentData } = req
    if (commentData.commentUser.toString() !== req.uid.toString()) {
        res.json({
            code: 401,
        })
        return
    }
    next()
})

router.post("/editor/autosave", (req, res) => {
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

router.post("/editor/image/upload", (req, res) => {
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

router.post("/editor/video/upload", (req, res) => {
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

router.post("/submit", (req, res) => {
    let { comments } = req.body
    let { commentData } = req
    let contents = ""
    for (let c of comments) {
        let { entry, content } = c
        let index = commentData.comment.findIndex(e => e.entry === entry)
        if (index > -1) {
            commentData.comment[index].content = content
        } else {
            commentData.comment.push(c)
        }
        contents += content
    }
    commentData.isSubmit = true
    commentData.time = new Date()
    processContentSource(commentData, contents)
        .then(d => {
            let { imagesID, videosID } = d
            commentData.images = imagesID
            commentData.videos = videosID
            commentData.save(err => {
                if (err) {
                    return
                }
                res.json({
                    code: 20000,
                })
            })
        })
        .catch(err => {
            console.log(err)
            res.json(err)
        })
})

router.use((req, res, next) => {
    let { commentData, course } = req
    let { chiefTeacher, partnerTeacher } = course
    if (
        commentData.commentUser.toString() !== req.uid &&
        chiefTeacher.toString() !== req.uid &&
        !partnerTeacher.find(e => e.toString() === req.uid)
    ) {
        res.json({
            code: 401,
        })
        return
    }
    next()
})

router.post("/remove", (req, res) => {
    let { commentData } = req
    commentData.isUsed = false
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

export default router
