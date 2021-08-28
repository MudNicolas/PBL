import Router from "express"

import Approvement from "#models/Approvement.js"

let router = Router()

router.get("/", (req, res) => {
    let { stage, activity } = req

    stage
        .execPopulate([
            { path: "authorUID", select: "name avatar" },
            { path: "files", select: "originalFilename size" },
        ])
        .then(async _stage => {
            let {
                content,
                authorUID,
                files,
                isUsed,
                isPublic,
                sketch,
                status,
                subjectName,
                _id,
                editable,
                isSaved,
            } = _stage

            files = files.map(e => {
                return {
                    name: e.originalFilename,
                    response: { _id: e._id },
                    size: e.size,
                }
            })

            let data = {
                content,
                authorUID,
                files,
                isUsed,
                isPublic,
                sketch,
                status,
                subjectName,
                _id,
                editable,
                isSaved,
            }

            if (activity.options.isTimeLimited) {
                let limitTime = activity.options.limitTime
                if (new Date() < new Date(limitTime[0]) || new Date() > new Date(limitTime[1])) {
                    data.timeout = true
                }
            }

            data.approvement = await Approvement.findOne({ stageID: _id })
                .select("time approver status reason")
                .populate({ path: "approver", select: "name" })
                .exec()

            res.json({
                code: 20000,
                data,
            })
        })
})

export default router
