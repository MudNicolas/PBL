import Activity from "#models/Activity.js"
import Router from "express"
let router = Router()
import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"
import TimeLineProject from "#models/TimeLineProject.js"

router.use((req, res, next) => {
    let activityID = req.body.activityID || req.query.activityID

    let validate = /^[a-fA-F0-9]{24}$/.test(activityID)
    if (!validate) {
        res.json({
            code: 404,
            message: "error",
        })
        return
    }
    Activity.findOne({
        _id: activityID,
        isUsed: true,
    })
        .populate({
            path: "sectionID",
            select: "courseID",
        })
        .then((acti, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }
            if (!acti) {
                res.json({
                    code: 404,
                    message: "error",
                })
                return
            }
            CheckCourseAvailableAndReqUserHasPermission(acti.sectionID.courseID, 0, req)
                .then(c => {
                    req.activity = acti
                    req.course = c
                    next()
                })
                .catch(err => {
                    res.json(err)
                })
        })
})

router.get("/type/get", (req, res) => {
    let { activity } = req
    let { type, name, intro, options } = activity
    res.json({
        code: 20000,
        data: { type, name, intro, options },
    })
})

function findStudentGroup(group, sid) {
    return group.find(g => {
        g.groupMember.some(m => {
            m.toString() === sid.toString()
        })
    })
}

router.get("/timeline/private/get", (req, res) => {
    let { activity, uid } = req

    let authorID
    if (activity.options.authorType === "group") {
        let { group } = req.course
        let userGroup = findStudentGroup(group, uid)
        if (!userGroup) {
            res.json({
                code: 34001,
                message: "你不属于任何小组",
            })
            return
        }
        authorID = userGroup._id
    } else {
        authorID = req.uid
    }
    let activityID = activity._id

    TimeLineProject.findOne({
        authorID,
        activityID,
    })
        .select("name intro time timeline")
        .then((project, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }
            res.json({
                code: 20000,
                data: project,
            })
        })
})

export default router
