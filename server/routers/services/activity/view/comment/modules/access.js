import Router from "express"

import Comment from "#models/Comment.js"

let router = Router()

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

export default router
