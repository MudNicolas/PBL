import Activity from "#models/Activity.js"
import Router from "express"
let router = Router()
import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"

import TimeLineProject from "#models/TimeLineProject.js"

//验证带id的stage的timeline的activity是否有权限访问
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
    TimeLineProject.findOne(
        {
            "stages._id": stageID,
        },
        {
            stages: 1,
            activityID: 1,
            authorType: 1,
            authorID: 1,
        }
    ).then((project, err) => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }
        if (!project) {
            res.json({
                message: "stage不存在",
            })
            return
        }
        req.activityID = project.activityID
        req.stageID = stageID
        req.project = project
        next()
    })
})

//验证带id的timeline的activity是否有权限访问
router.use((req, res, next) => {
    let projectID = req.body.projectID || req.query.projectID
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
router.use("/timeline", timeline)

export default router
