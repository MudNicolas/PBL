import Router from "express"

import Comment from "#models/Comment.js"

import { processImgAndVideoHostUrl } from "#services/tools/index.js"

let router = Router()

router.get("/", (req, res) => {
    let { stageID, type } = req.query

    let comments = Comment.find({
        activityContentID: stageID,
        type,
        isSubmit: true,
        isUsed: true,
    })
        .select({ commentUser: 1, comment: 1, time: 1, reply: 1, commentUserRole: 1 })
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
                    commentUserRole: e.commentUserRole,
                    comment: e.comment.map(c => {
                        c.content = processImgAndVideoHostUrl(c.content)
                        return c
                    }),
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

export default router
