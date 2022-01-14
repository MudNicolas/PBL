import Router from "express"
import { processImgAndVideoHostUrl } from "#services/tools/index.js"

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
        if (req.role === "student") {
            let { options } = activity
            if (options.isUseCommentTemplate) {
                dimensions = options.dimensions
            }
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

export default router
