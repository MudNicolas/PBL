import Router from "express"

import Approvement from "#models/Approvement.js"

let router = Router()

router.get("/get", async (req, res) => {
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

router.post("/submit", (req, res) => {
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
