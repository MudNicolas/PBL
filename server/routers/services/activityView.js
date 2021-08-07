import Activity from "#models/Activity.js"
import Router from "express"
let router = Router()
import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"

import TimeLineProject from "#models/TimeLineProject.js"

//验证带id的timeline的activity是否有权限访问
router.use((req, res, next) => {
    let { projectID } = req.body || req.query
    if (!projectID) {
        return next()
    }
    let validate = /^[a-fA-F0-9]{24}$/.test(projectID)
    if (!validate) {
        res.json({
            code: 404,
            message: "error",
        })
        return
    }
    TimeLineProject.findById(projectID).then((proj, err) => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }
        if (!proj) {
            res.json({
                message: "不存在此项目",
            })
            return
        }

        req.activityID = proj.activityID
        req.project = proj
        next()
    })
})

router.use((req, res, next) => {
    let activityID = req.body.activityID || req.query.activityID || req.activityID

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

import timeline from "#services/modules/activityView/timeline.js"
router.use("/timeline", timeline)

export default router
