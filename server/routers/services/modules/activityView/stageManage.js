import Router from "express"
let router = Router()

router.get("/info/get", (req, res) => {
    let { stage, activity } = req

    stage.execPopulate([{ path: "authorUID", select: "name avatar" }]).then(_stage => {
        let { authorUID, isUsed, isPublic, sketch, status, subjectName, _id, editable } = _stage
        let { isNeedApprove } = activity.options
        let data = {
            authorUID,
            isUsed,
            isPublic,
            sketch,
            status,
            subjectName,
            _id,
            editable,
            isNeedApprove,
        }

        res.json({
            code: 20000,
            data,
        })
    })
})

router.get("/editLog/get", (req, res) => {
    let { stage } = req
    stage
        .execPopulate({
            path: "editLog.uid",
            select: "name",
        })
        .then(_stage => {
            let { editLog } = _stage
            res.json({
                code: 20000,
                data: editLog,
            })
        })
})

router.use((req, res, next) => {
    let { stage } = req
    if (stage.status === "abandoned") {
        res.json({
            message: "该阶段已废弃",
        })
        return
    }
    next()
})

router.post("/info/save", (req, res) => {
    let { stage } = req
    let { subjectName, sketch } = req.body
    stage.subjectName = subjectName
    stage.sketch = sketch
    stage.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }
        res.json({
            code: 20000,
        })
    })
})

router.post("/danger/submit", (req, res) => {
    let { type } = req.body
    let { stage } = req
    if (type === "public") {
        stage.isPublic = true
    }
    if (type === "approve") {
        let { project } = req
        stage.status = "underApprove"
        project.status = "underApprove"
        project.save(err => {
            if (err) {
                console.log(err)
                return
            }
        })
    }
    if (type === "abandon" && stage.status !== "underApprove") {
        stage.status = "abandoned"
    }
    stage.editable = false

    stage.save(err => {
        if (err) {
            res.json({
                code: 30001,
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
