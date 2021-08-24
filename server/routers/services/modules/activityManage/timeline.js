import Router from "express"
let router = Router()

import TimeLineProject from "#models/TimeLineProject.js"
import Stage from "#models/Stage.js"
import User from "#models/User.js"
import Approvement from "#models/Approvement.js"

router.get("/approve/get", (req, res) => {
    let { activity, course } = req

    if (!activity.options.isNeedApprove) {
        res.json({
            code: 20000,
            data: { needApprove: false },
        })
        return
    }

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
                    status: { $in: ["underApprove", "approved"] },
                })
                    .select("submitAuditTime subjectName")
                    .then(async stages => {
                        let latestSubmitAuditTime
                        let submitForApproveNumber = stages.length
                        let stageID = ""

                        if (submitForApproveNumber > 0) {
                            latestSubmitAuditTime = stages[stages.length - 1].submitAuditTime
                            stageID = stages[stages.length - 1]._id
                        }

                        let { status } = TLProject
                        let projectName = TLProject.name
                        return {
                            stageID,
                            projectName,
                            authors,
                            latestSubmitAuditTime,
                            status,
                            submitForApproveNumber,
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
                data: {
                    projects,
                    isNeedApprove: true,
                },
            })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get("/approve/single/get", async (req, res) => {
    let _stage = req.stage

    let _project = req.project

    _stage = await _stage.execPopulate([
        { path: "authorUID", select: "name avatar" },
        { path: "files", select: "originalFilename size" },
    ])

    let { name, intro } = _project
    let { authorUID, subjectName, files, content, sketch } = _stage
    let project = {
        name,
        intro,
        authors: authorUID,
        status: _project.status,
    }
    let stage = {
        subjectName,
        files,
        status: _stage.status,
        content,
        sketch,
    }

    let activityID = req.activity._id

    let approvement = await Approvement.findOne({
        timeLineProjectID: _project._id,
        stageID: _stage._id,
    })
        .select("time approver status reason")
        .populate({ path: "approver", select: "name" })
        .exec()

    res.json({
        code: 20000,
        data: { project, stage, activityID, approvement },
    })
})

router.use((req, res, next) => {
    let { stage } = req
    if (stage.status !== "underApprove") {
        res.json({
            code: 404,
            message: "该阶段非待审批阶段",
        })
        return
    }
    next()
})

router.post("/approve/single/submit", (req, res) => {
    let { approvement, stageID } = req.body
    let { status, reason } = approvement
    if (!["approved", "rejected"].includes(status)) {
        return
    }

    let timeLineProjectID = req.project._id
    let newApv = new Approvement({
        timeLineProjectID,
        stageID,
        time: new Date(),
        approver: req.uid,
        status,
        reason,
    })

    let { stage, project } = req

    if (status === "rejected") {
        stage.status = status
    } else {
        stage.status = status
        project.status = "normal"
    }

    stage
        .save()
        .then(() => {
            project.save().then(() => {
                newApv.save(() => {
                    res.json({
                        code: 20000,
                    })
                })
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
