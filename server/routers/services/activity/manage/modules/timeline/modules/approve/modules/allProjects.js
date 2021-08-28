import Router from "express"

import TimeLineProject from "#models/TimeLineProject.js"
import Stage from "#models/Stage.js"
import User from "#models/User.js"

let router = Router()

router.get("/get", (req, res) => {
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
                    status: {
                        $in: [
                            "underApprove",
                            "approved",
                            "rejected",
                            "underConcludeApprove",
                            "conclude",
                            "concludeRejected",
                        ],
                    },
                })
                    .select("submitAuditTime subjectName submitConcludeTime status")
                    .then(async stages => {
                        let submitTime
                        let stageID = ""

                        let stageStatus
                        if (stages.length > 0) {
                            submitTime =
                                stages[stages.length - 1].submitAuditTime ||
                                stages[stages.length - 1].submitConcludeTime
                            stageID = stages[stages.length - 1]._id
                            stageStatus = stages[stages.length - 1].status
                        }

                        let projectStatus = TLProject.status

                        let projectName = TLProject.name
                        let projectID = TLProject._id
                        return {
                            stageID,
                            projectID,
                            projectName,
                            authors,
                            submitTime,
                            projectStatus,
                            stageStatus,
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
                },
            })
        })
        .catch(err => {
            console.log(err)
        })
})

export default router
