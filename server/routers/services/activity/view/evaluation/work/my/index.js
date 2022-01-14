import Router from "express"
import pretreat from "./modules/pretreat.js"
import editor from "./modules/editor.js"
import EvaluationWork from "#models/EvaluationWork.js"
import User from "#models/User.js"

import {
    processContentSource,
    processStageFiles,
    processImgAndVideoHostUrl,
} from "#services/tools/index.js"

let router = Router()

router.use(pretreat)

router.get("/get", (req, res) => {
    let { activity } = req

    let authorID = req.uid
    if (activity.options.authorType === "group") {
        let { group } = req
        authorID = group._id
    }

    let activityID = activity._id

    EvaluationWork.findOne({
        authorID,
        activityID,
    })
        .select(
            "activityID authorType authorID workName sketch createTime lastSubmitTime content files isSubmit"
        )
        .populate([
            { path: "authorUID", select: "name avatar" },
            { path: "files", select: "originalFilename size" },
        ])
        .then(async (work, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }

            if (!work) {
                res.json({
                    code: 20000,
                    data: {
                        status: "NoWork",
                    },
                })
                return
            }

            let { authorType } = work
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

            work = work.toJSON()

            work.files = work.files.map(e => {
                return {
                    name: e.originalFilename,
                    response: { _id: e._id },
                    size: e.size,
                }
            })

            work.content = processImgAndVideoHostUrl(work.content)

            work.authors = authors

            work.editable = false
            work.evaluatable = false

            if (activity.options.phaseSwitchMethod === "auto") {
                let submitLimitTime = activity.options.submitLimitTime
                if (
                    new Date() > new Date(submitLimitTime[0]) &&
                    new Date() < new Date(submitLimitTime[1])
                ) {
                    work.editable = true
                }
                let evaluationLimitTime = activity.options.evaluationLimitTime
                if (
                    new Date() > new Date(evaluationLimitTime[0]) &&
                    new Date() < new Date(evaluationLimitTime[1])
                ) {
                    work.evaluatable = true
                }
            }
            if (activity.options.phaseSwitchMethod === "manual") {
                let { phase } = activity.options
                if (phase === "submission") {
                    work.editable = true
                }
                if (phase === "evaluation") {
                    work.evaluatable = true
                }
            }

            res.json({
                code: 20000,
                data: { work },
            })
        })
})

router.use((req, res, next) => {
    let { activity } = req
    if (activity.options.phaseSwitchMethod === "auto") {
        let submitLimitTime = activity.options.submitLimitTime
        if (
            new Date() > new Date(submitLimitTime[0]) &&
            new Date() < new Date(submitLimitTime[1])
        ) {
            return next()
        }
    }
    if (activity.options.phaseSwitchMethod === "manual") {
        let { phase } = activity.options
        if (phase === "submission") {
            return next()
        }
    }
    res.json({
        message: "当前已不能更改作品",
    })
})

function findStudentGroup(group, sid) {
    return group.find(g => g.groupMember.some(m => m.toString() === sid.toString()))
}

router.use((req, res, next) => {
    let { activity, uid } = req
    if (activity.options.authorType === "group" && req.role === "student") {
        let { group } = req.course
        let userGroup = findStudentGroup(group, uid)
        if (!userGroup) {
            res.json({
                code: 34001,
                message: "你不属于任何小组",
            })
            return
        }
        req.group = userGroup
    }
    next()
})

router.post("/create", (req, res) => {
    let { activityID } = req.body
    if (req.role !== "student") {
        res.json({
            message: "你的角色不能创建project",
        })
        return
    }
    let { activity } = req

    let authorType = activity.options.authorType

    let authorUID = [req.uid]
    let authorID = req.uid
    if (authorType === "group") {
        let { group } = req
        authorUID = group.groupMember
        authorID = group._id
    }

    let work = new EvaluationWork({
        authorType,
        activityID,
        authorID,
        authorUID,
        createTime: new Date(),
        editLog: [
            {
                uid: req.uid,
                time: new Date(),
                operation: "创建",
            },
        ],
    })
    work.save(err => {
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

router.use("/editor", editor)

router.post("/save", (req, res) => {
    let { work: newWork } = req.body
    let { work: oldWork } = req
    let { content, files, workName, sketch } = newWork
    oldWork.content = content
    oldWork.files = files
    oldWork.workName = workName
    oldWork.sketch = sketch
    oldWork.lastSubmitTime = new Date()
    oldWork.editLog.push({
        uid: req.uid,
        time: new Date(),
        operation: "编辑保存",
    })
    oldWork.isSubmit = true
    processContentSource(oldWork, content)
        .then(d => {
            let { imagesID, videosID } = d
            oldWork.images = imagesID
            oldWork.videos = videosID

            processStageFiles(oldWork, files).then(() => {
                oldWork.save(err => {
                    if (err) {
                        return
                    }
                    res.json({
                        code: 20000,
                    })
                })
            })
        })
        .catch(err => {
            console.log(err)
            res.json(err)
        })
})

export default router
