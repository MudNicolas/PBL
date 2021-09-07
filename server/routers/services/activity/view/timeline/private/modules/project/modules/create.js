import Router from "express"

import TimeLineProject from "#models/TimeLineProject.js"

let router = Router()

router.post("/", (req, res) => {
    let { project, activityID } = req.body
    let { name, intro } = project
    if (!name) {
        res.json({
            message: "项目名称不能为空",
        })
        return
    }
    if (req.role !== "student") {
        res.json({
            message: "你的角色不能创建project",
        })
        return
    }
    let { activity } = req
    let status = "normal"

    if (activity.options.isNeedApprove) {
        status = "beforeApprove"
    }

    let authorType = activity.options.authorType
    let authorID = req.uid
    if (authorType === "group") {
        let { group } = req

        authorID = group._id
    }
    let timelineProject = new TimeLineProject({
        name,
        intro,
        activityID,
        time: new Date(),
        authorID,
        authorType,
        status,
    })
    timelineProject.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "Database Error",
            })
            return
        }

        res.json({
            code: 20000,
        })
    })
})

export default router
