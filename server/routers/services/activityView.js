import Activity from "#models/Activity.js"
import Router from "express"
let router = Router()
import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"

import TimeLineProject from "#models/TimeLineProject.js"
import Stage from "#models/Stage.js"

//验证stage的timeline的activity是否有权限访问
router.use((req, res, next) => {
    let stageID = req.body.stageID || req.query.stageID

    if (!stageID) {
        return next()
    }

    let validate = /^[a-fA-F0-9]{24}$/.test(stageID)
    if (!validate) {
        res.json({
            code: 404,
            message: "stage不存在",
        })
        return
    }
    Stage.findOne({
        _id: stageID,
        notification: {
            $exists: false,
        },
    }).then((stage, err) => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }
        if (!stage) {
            res.json({
                code: 404,
                message: "stage不存在",
            })
            return
        }

        req.projectID = stage.timelineProjectID
        req.stage = stage
        next()
    })
})

//验证带id的timeline的activity是否有权限访问
router.use((req, res, next) => {
    let projectID = req.body.projectID || req.query.projectID || req.projectID
    if (!projectID) {
        return next()
    }
    let validate = /^[a-fA-F0-9]{24}$/.test(projectID)
    if (!validate) {
        res.json({
            code: 404,
            message: "不存在此项目",
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
                code: 404,
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
            message: "不存在此活动",
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
                    message: "不存在此活动",
                })
                return
            }
            CheckCourseAvailableAndReqUserHasPermission(acti.sectionID.courseID, 0, req)
                .then(c => {
                    req.activity = acti
                    req.course = c
                    req.courseID = c._id
                    req.sectionID = acti.sectionID
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
import comments from "#services/modules/comments/comments.js"
router.use("/timeline", timeline)
router.use("/comments", comments)

export default router
