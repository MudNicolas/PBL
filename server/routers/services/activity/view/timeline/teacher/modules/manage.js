import Router from "express"

import User from "#models/User.js"
import Stage from "#models/Stage.js"

let router = Router()

router.post("/status/reset", async (req, res) => {
    let { status, notification } = req.body
    if (!["beforeApprove", "normal"].includes(status)) {
        res.json({
            message: "error",
        })
        return
    }
    let { project } = req
    project.status = status
    let t = await User.findById(req.uid).select("name").exec()
    let map = {
        beforeApprove: "待提审",
        normal: "行进中",
    }
    Stage({
        notification: `由于 ${notification} ,${t.name}将本项目的状态重置为 ${map[status]}`,
        timelineProjectID: project._id,
        createTime: new Date(),
        isPublic: true,
        publicTime: new Date(),
    })
        .save()
        .then(() => {
            project.save().then(() => {
                res.json({ code: 20000 })
            })
        })
        .catch(err => {
            console.log(err)
            res.json({
                code: 30001,
                message: "Database Error",
            })
        })
})

export default router
