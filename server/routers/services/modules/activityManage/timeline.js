import Router from "express"
let router = Router()

import TimeLineProject from "#models/TimeLineProject.js"
import Stage from "#models/Stage.js"
import User from "#models/User.js"

router.get("/approve/get", (req, res) => {
    let { activity, course } = req

    if (!activity.options.isNeedApprove) {
        res.json({
            code: 20000,
            data: { needApprove: false },
        })
        return
    }

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
                    status: { $in: ["underApprove", "approved"] },
                })
                    .select("submitAuditTime subjectName")
                    .then(async stages => {
                        let latestSubmitAuditTime
                        let submitForApproveNumber = stages.length

                        if (submitForApproveNumber > 0) {
                            latestSubmitAuditTime = stages[stages.length - 1].submitAuditTime
                        }

                        let { status } = TLProject
                        let projectName = TLProject.name
                        return {
                            _id: TLProject._id,
                            projectName,
                            authors,
                            latestSubmitAuditTime,
                            status,
                            submitForApproveNumber,
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
                data: {
                    projects,
                    isNeedApprove: true,
                },
            })
        })
        .catch(err => {
            console.log(err)
        })
})

export default router
