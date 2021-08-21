import Router from "express"
let router = Router()

import TimeLineProject from "#models/TimeLineProject.js"
import Stage from "#models/Stage.js"
import User from "#models/User.js"

router.get("/getAll", (req, res) => {
    let { activity, course } = req
    let { authorType } = activity.options
    let activityID = activity._id
    let authors

    if (authorType === "personal") {
        authors = course.studentList.map(e => {
            return {
                _id: e,
                uid: [e],
            }
        })
    } else {
        authors = course.group.map(e => {
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

        return TimeLineProject.findOne({
            activityID,
            authorType,
            authorID: e._id,
        })
            .select("name status")
            .then(TLProject => {
                if (!TLProject) {
                    return {
                        projectName: "",
                        authors,
                    }
                }

                return Stage.find({
                    timelineProjectID: TLProject._id,
                    isPublic: true,
                })
                    .select("publicTime")
                    .then(async stages => {
                        let latestPublicTime
                        let publicStageNumber = stages.length

                        if (stages.length > 0) {
                            latestPublicTime = stages[stages.length - 1].publicTime
                        }

                        let { status } = TLProject
                        let projectName = TLProject.name
                        return {
                            _id: TLProject._id,
                            projectName,
                            authors,
                            latestPublicTime,
                            status,
                            publicStageNumber,
                        }
                    })
            })
    })
    Promise.all(findArray)
        .then(projects => {
            projects.sort((x, y) => {
                return x.authors[0] > y.authors[0]
            })
            projects.sort((x, y) => {
                return x.projectName > y.projectName ? -1 : 1
            })
            res.json({
                code: 20000,
                data: projects,
            })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get("/getSingle", (req, res) => {
    let _project = req.project
    let { _id } = _project

    Stage.find({
        timelineProjectID: _id,
        isPublic: true,
    })
        .select("subjectName sketch createTime isPublic status isUsed")
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

router.get("/stage/get", (req, res) => {
    let { stage, activity } = req

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

            let { options } = activity
            let entry = []
            if (options.isUseCommentTemplate) {
                entry = options.commentTemplate
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
