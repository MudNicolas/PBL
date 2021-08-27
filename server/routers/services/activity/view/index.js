import Router from "express"

import timeline from "./timeline/index.js"
import comments from "./comment/index.js"

import {
    stagePermission,
    timelineProjectPermission,
    activityPermission,
} from "#services/tools/index.js"

let router = Router()

//验证stage的timeline的activity是否有权限访问
router.use((req, res, next) => {
    let stageID = req.body.stageID || req.query.stageID
    if (!stageID) {
        return next()
    }

    stagePermission(stageID)
        .then(({ projectID, stage }) => {
            req.projectID = projectID
            req.stage = stage
            next()
        })
        .catch(err => {
            console.log(err)
            res.json(err)
        })
})

//验证带id的timeline的activity是否有权限访问
router.use((req, res, next) => {
    let projectID = req.body.projectID || req.query.projectID || req.projectID
    if (!projectID) {
        return next()
    }
    timelineProjectPermission(projectID)
        .then(({ activityID, project }) => {
            req.activityID = activityID
            req.project = project
            next()
        })
        .catch(err => {
            console.log(err)
            res.json(err)
        })
})

router.use((req, res, next) => {
    let activityID = req.body.activityID || req.query.activityID || req.activityID
    activityPermission(activityID, req, 0)
        .then(({ activity, course, courseID, sectionID }) => {
            req.activity = activity
            req.course = course
            req.courseID = courseID
            req.sectionID = sectionID
            next()
        })
        .catch(err => {
            console.log(err)
            res.json(err)
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

router.use("/timeline", timeline)
router.use("/comments", comments)

export default router
