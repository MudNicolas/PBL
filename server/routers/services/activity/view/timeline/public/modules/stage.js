import Router from "express"
let router = Router()

router.get("/get", (req, res) => {
    let { stage, activity } = req

    if (!stage.isPublic && req.role === "student") {
        res.json({
            code: 401,
        })
        return
    }

    stage
        .execPopulate([
            { path: "authorUID", select: "name avatar" },
            { path: "files", select: "originalFilename size" },
        ])
        .then(_stage => {
            let { content, authorUID, files, isUsed, isPublic, sketch, status, subjectName, _id } =
                _stage

            files = files.map(e => {
                return {
                    name: e.originalFilename,
                    response: { _id: e._id },
                    size: e.size,
                }
            })

            //只有学生受template影响
            let entry = []
            if (req.role === "student") {
                let { options } = activity
                if (options.isUseCommentTemplate) {
                    entry = options.commentTemplate
                }
            }

            let stage = {
                content,
                authorUID,
                files,
                isUsed,
                isPublic,
                sketch,
                status,
                subjectName,

                _id,
            }

            if (activity.options.isTimeLimited) {
                let limitTime = activity.options.limitTime
                if (new Date() < new Date(limitTime[0]) || new Date() > new Date(limitTime[1])) {
                    stage.timeout = true
                }
            }

            res.json({
                code: 20000,
                data: {
                    stage,
                    entry,
                },
            })
        })
})

export default router
