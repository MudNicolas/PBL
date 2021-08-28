import Router from "express"

let router = Router()

router.post("/submit", (req, res) => {
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
        fromUserRole: req.role,
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

router.post("/remove", (req, res) => {
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

export default router
