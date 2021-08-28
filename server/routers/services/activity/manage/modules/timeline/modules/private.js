import Router from "express"

import Stage from "#models/Stage.js"
import User from "#models/User.js"

let router = Router()

router.get("/get", async (req, res) => {
    let { project } = req

    let authorID = project.authorID

    let { authorType } = project
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

    project = project.toJSON()

    project.authors = authors
    project.own = false

    Stage.find({
        timelineProjectID: project._id,
    })
        .select("subjectName sketch createTime isPublic status isUsed notification")
        .then(stages => {
            res.json({
                code: 20000,
                data: { project, stages },
            })
        })
})

export default router
