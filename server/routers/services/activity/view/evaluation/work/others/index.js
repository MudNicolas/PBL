import Router from "express"
import { processImgAndVideoHostUrl } from "#services/tools/index.js"
import User from "#models/User.js"
import EvaluationWork from "#models/EvaluationWork.js"

let router = Router()

router.get("/get", (req, res) => {
    let { work, activity } = req
    work.execPopulate([
        { path: "authorUID", select: "name avatar" },
        { path: "files", select: "originalFilename size" },
    ]).then(popuWork => {
        let { content, authorUID, files, isUsed, sketch, workName, _id } = popuWork

        files = files.map(e => {
            return {
                name: e.originalFilename,
                response: { _id: e._id },
                size: e.size,
            }
        })

        //只有学生受template影响
        let dimensions = []

        let { options } = activity
        if (options.isUseCommentTemplate) {
            dimensions = options.dimensions
        }

        content = processImgAndVideoHostUrl(content)
        let work = {
            content,
            authorUID,
            files,
            isUsed,
            sketch,
            workName,
            _id,
        }

        work.evaluatable = false

        if (activity.options.phaseSwitchMethod === "auto") {
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
            if (phase === "evaluation") {
                work.evaluatable = true
            }
        }
        res.json({
            code: 20000,
            data: {
                work,
                dimensions,
            },
        })
    })
})

router.get("/all/get", (req, res) => {
    let { activity, course } = req
    let { authorType } = activity.options
    let activityID = activity._id
    let authors

    if (authorType === "personal") {
        authors = course.studentList
            .filter(e => String(e) !== String(req.uid))
            .map(e => {
                return {
                    _id: e,
                    uid: [e],
                }
            })
    } else {
        authors = course.group
            .filter(e => e.groupMember.find(id => String(id) !== String(req.uid)))
            .map(e => {
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

        return EvaluationWork.findOne({
            activityID,
            authorType,
            authorID: e._id,
            isSubmit: true,
        })
            .select("workName lastSubmitTime")
            .then(work => {
                if (!work) {
                    return {
                        workName: "",
                        authors,
                    }
                }
                let { _id, workName, lastSubmitTime } = work
                return { _id, workName, authors, lastSubmitTime }
            })
    })
    Promise.all(findArray)
        .then(works => {
            works.sort((x, y) => {
                return x.authors[0] > y.authors[0]
            })
            works.sort((x, y) => {
                return x.workName > y.workName ? -1 : 1
            })
            res.json({
                code: 20000,
                data: works,
            })
        })
        .catch(err => {
            console.log(err)
        })
})

export default router
