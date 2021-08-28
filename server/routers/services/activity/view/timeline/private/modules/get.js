import Router from "express"

import TimeLineProject from "#models/TimeLineProject.js"
import Stage from "#models/Stage.js"
import User from "#models/User.js"

let router = Router()

router.get("/", (req, res) => {
    let { activity } = req

    let authorID = req.uid
    if (activity.options.authorType === "group") {
        let { group } = req
        authorID = group._id
    }

    let activityID = activity._id

    TimeLineProject.findOne({
        authorID,
        activityID,
    })
        .select("name intro time status authorType")
        .then(async (project, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }

            if (!project) {
                res.json({
                    code: 20000,
                    data: {
                        status: "NoProject",
                    },
                })
                return
            }

            let { authorType } = project
            let authorsUID
            if (authorType === "personal") {
                authorsUID = [authorID]
            } else {
                let { course } = req
                let { group } = course
                let g = group.find(e => e._id.toString() === authorID.toString())
                authorsUID = g.groupMember
            }

            let authors = await User.find({
                _id: { $in: authorsUID },
            })
                .select("name avatar")
                .then(u => {
                    return u
                })

            project = project.toJSON()

            project.authors = authors

            if (activity.options.isTimeLimited) {
                let limitTime = activity.options.limitTime
                if (new Date() < new Date(limitTime[0]) || new Date() > new Date(limitTime[1])) {
                    project.timeout = true
                }
            }

            project.own = true

            Stage.find({
                timelineProjectID: project._id,
            })
                .select("subjectName sketch createTime isPublic status isUsed notification")
                .then(stages => {
                    res.json({
                        code: 20000,
                        data: { project, stages },
                    })
                })
        })
})

export default router
