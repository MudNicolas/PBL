import Router from "express"

import User from "#models/User.js"
import EvaluationWork from "#models/EvaluationWork.js"

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
            console.log(works)
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
