import Router from "express"
import pretreat from "./modules/pretreat.js"
import editor from "./modules/editor.js"
import EvaluationWork from "#models/EvaluationWork.js"
import User from "#models/User.js"

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
            "activityID authorType authorID workName sketch createTime lastSubmitTime content files"
        )
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
    let authorID = req.uid
    if (authorType === "group") {
        let { group } = req

        authorID = group._id
    }
    let work = new EvaluationWork({
        authorType,
        activityID,
        authorID,
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

export default router
