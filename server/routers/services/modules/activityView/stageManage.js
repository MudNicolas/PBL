import Router from "express"
let router = Router()
import Stage from "#models/Stage.js"

router.get("/info/get", (req, res) => {
    let { stage, activity } = req

    stage.execPopulate([{ path: "authorUID", select: "name avatar" }]).then(async _stage => {
        let {
            authorUID,
            isUsed,
            isPublic,
            sketch,
            status,
            subjectName,
            _id,
            editable,
            timelineProjectID,
        } = _stage
        let { isNeedApprove } = activity.options

        let allStages = await Stage.find({ timelineProjectID }).select("status").exec()
        let isLast = false
        if (allStages.pop()._id.toString() === _id.toString()) {
            isLast = true
        }

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
            isLast,
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

router.use(async (req, res, next) => {
    let { type } = req.body
    let { stage } = req

    if (type === "public" && stage.isPublic) {
        res.json({
            message: "该阶段已公开过",
        })
        return
    }

    if (type === "approve") {
        let { project } = req
        if (stage.status !== "beforeApprove" || project.status !== "beforeApprove") {
            res.json({
                message: "当前已不是待审核阶段",
            })
            return
        }

        let { timelineProjectID } = stage
        let allStages = await Stage.find({ timelineProjectID }).select("status").exec()
        let isLast = false
        if (allStages.pop()._id.toString() === stage._id.toString()) {
            isLast = true
        }
        if (!isLast) {
            res.json({
                message: "该阶段不可提交审批",
            })
            return
        }
    }

    if (type === "abandon" && stage.status === "underApprove") {
        res.json({
            message: "当前阶段不可被废弃",
        })
        return
    }

    next()
})

router.post("/danger/submit", (req, res) => {
    let { type } = req.body
    let { stage } = req
    if (type === "public") {
        stage.isPublic = true
        stage.publicTime = new Date()
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
    if (type === "abandon") {
        stage.status = "abandoned"
    }
    stage.editable = false

    let operation = {
        public: "公开",
        approve: "提交审核",
        abandon: "废弃",
    }

    stage.editLog.push({
        uid: req.uid,
        time: new Date(),
        operation: operation[type],
    })

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
