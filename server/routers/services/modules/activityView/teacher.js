import Router from "express"
let router = Router()
import User from "#models/User.js"
import TimeLineProject from "#models/TimeLineProject.js"
import Stage from "#models/Stage.js"

router.use((req, res, next) => {
    if (req.role !== "teacher") {
        res.json({
            code: 401,
        })
        return
    }
    next()
})

router.get("/getAll", (req, res) => {
    let { activity, course } = req
    let { authorType } = activity.options
    let activityID = activity._id
    let authors

    if (authorType === "personal") {
        authors = course.studentList.map(e => {
            return {
                _id: e,
                uid: [e],
            }
        })
    } else {
        authors = course.group.map(e => {
            return {
                _id: e._id,
                uid: e.groupMember,
            }
        })
    }

    let findArray = authors.map(async e => {
        let authors = await User.find({
            _id: { $in: e.uid },
        })
            .select("name")
            .then(u => {
                return u
            })

        return TimeLineProject.findOne({
            activityID,
            authorType,
            authorID: e._id,
        })
            .select("name status")
            .then(TLProject => {
                if (!TLProject) {
                    return {
                        projectName: "",
                        authors,
                    }
                }

                return Stage.find({
                    timelineProjectID: TLProject._id,
                })
                    .select("_id")
                    .then(async stages => {
                        let stageNumber = stages.length

                        let { status } = TLProject
                        let projectName = TLProject.name
                        return {
                            _id: TLProject._id,
                            projectName,
                            authors,

                            status,
                            stageNumber,
                        }
                    })
            })
    })
    Promise.all(findArray)
        .then(projects => {
            projects.sort((x, y) => {
                return x.authors[0] > y.authors[0]
            })
            projects.sort((x, y) => {
                return x.projectName > y.projectName ? -1 : 1
            })
            res.json({
                code: 20000,
                data: projects,
            })
        })
        .catch(err => {
            console.log(err)
        })
})

router.post("/manage/status/reset", async (req, res) => {
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
