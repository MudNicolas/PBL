import Router from "express"
let router = Router()

import TimeLineProject from "#models/TimeLineProject.js"
import Stage from "#models/Stage.js"
import User from "#models/User.js"
import Approvement from "#models/Approvement.js"

router.get("/private/get", async (req, res) => {
    let { activity, project } = req

    let authorID = req.uid
    if (activity.options.authorType === "group") {
        let { group } = req
        authorID = group._id
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

    Stage.find({
        timelineProjectID: project._id,
    })
        .select("subjectName sketch createTime isPublic status isUsed")
        .then(stages => {
            res.json({
                code: 20000,
                data: { project, stages },
            })
        })
})

router.get("/approve/get", (req, res) => {
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
                    status: {
                        $in: [
                            "underApprove",
                            "approved",
                            "rejected",
                            "underConcludeApprove",
                            "conclude",
                            "concludeRejected",
                        ],
                    },
                })
                    .select("submitAuditTime subjectName submitConcludeTime status")
                    .then(async stages => {
                        let submitTime
                        let stageID = ""

                        let stageStatus
                        if (stages.length > 0) {
                            submitTime =
                                stages[stages.length - 1].submitAuditTime ||
                                stages[stages.length - 1].submitConcludeTime
                            stageID = stages[stages.length - 1]._id
                            stageStatus = stages[stages.length - 1].status
                        }

                        let projectStatus = TLProject.status

                        let projectName = TLProject.name
                        let projectID = TLProject._id
                        return {
                            stageID,
                            projectID,
                            projectName,
                            authors,
                            submitTime,
                            projectStatus,
                            stageStatus,
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
                },
            })
        })
        .catch(err => {
            console.log(err)
        })
})

router.use((req, res, next) => {
    let { stage } = req
    if (
        ![
            "underApprove",
            "approved",
            "rejected",
            "underConcludeApprove",
            "conclude",
            "concludeRejected",
        ].includes(stage.status)
    ) {
        res.json({
            code: 404,
        })
        return
    }
    next()
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
    if (!["underApprove", "underConcludeApprove"].includes(stage.status)) {
        res.json({
            code: 404,
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

    //前期审批
    if (stage.status === "underApprove") {
        if (status === "rejected") {
            stage.status = "rejected"
            project.status = "beforeApprove"
        } else {
            stage.status = "approved"
            project.status = "normal"
        }
    } else {
        //结题审批
        if (status === "rejected") {
            stage.status = "concludeRejected"
            project.status = "normal"
        } else {
            stage.status = "conclude"
            project.status = "conclude"
        }
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
