import Router from "express"

import {
    stagePermission,
    timelineProjectPermission,
    activityPermission,
    evaluationWorkPermission,
} from "#services/tools/index.js"

let router = Router()

//验证stage的timeline的activity是否有权限访问
router.use((req, res, next) => {
    let workID = req.body.workID || req.query.workID
    if (!workID) {
        return next()
    }

    evaluationWorkPermission(workID)
        .then(({ activityID, work }) => {
            req.activityID = activityID
            req.work = work
            next()
        })
        .catch(err => {
            console.log(err)
            res.json(err)
        })
})

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

export default router
