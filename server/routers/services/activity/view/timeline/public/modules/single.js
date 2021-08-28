import Router from "express"
let router = Router()

import Stage from "#models/Stage.js"
import User from "#models/User.js"

router.get("/get", (req, res) => {
    let _project = req.project
    let { _id } = _project

    Stage.find({
        timelineProjectID: _id,
        isPublic: true,
    })
        .select("subjectName sketch createTime isPublic status isUsed notification")
        .then(async stages => {
            let { _id, name, intro, authorID, status, authorType } = _project

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

            let project = {
                _id,
                name,
                intro,
                authors,
                status,
            }
            res.json({
                code: 20000,
                data: { project, stages },
            })
        })
})

export default router
