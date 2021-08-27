import Router from "express"

import timeline from "./modules/timeline.js"

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
    activityPermission(activityID, req, 1)
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
    let { type } = activity
    res.json({
        code: 20000,
        data: { type },
    })
})

router.get("/info/get", (req, res) => {
    let { activity } = req
    let { type, options, name, intro, sectionID } = activity
    sectionID = sectionID._id
    res.json({
        code: 20000,
        data: {
            type,
            options,
            name,
            intro,
            sectionID,
        },
    })
})

function validateEditActivity(activity, type) {
    let { name, isTimeLimited, limitTime, isUseCommentTemplate, commentTemplate } = activity
    if (type === "TimeLineProject") {
        if (!name.trim()) {
            return false
        }
        if (![true, false].includes(isTimeLimited)) {
            return false
        }

        if (![true, false].includes(isUseCommentTemplate)) {
            return false
        }
        if (isUseCommentTemplate && !Array.isArray(commentTemplate)) {
            return false
        }

        if (
            isTimeLimited &&
            (!limitTime[0] ||
                !limitTime[1] ||
                new Date(limitTime[0]).toString() === "Invalid Date" ||
                new Date(limitTime[1]).toString() === "Invalid Date" ||
                new Date(limitTime[0]) > new Date(limitTime[1]))
        ) {
            return false
        }

        return true
    }
    return false
}

function formatOptions(activityInfo) {
    let { isTimeLimited, limitTime, isUseCommentTemplate, commentTemplate } = activityInfo
    let options = {
        isTimeLimited,
        isUseCommentTemplate,
    }
    if (isTimeLimited) {
        options.limitTime = [new Date(limitTime[0]), new Date(limitTime[1])]
    } else {
        options.limitTime = null
    }
    if (isUseCommentTemplate) {
        options.commentTemplate = commentTemplate
    } else {
        options.commentTemplate = null
    }
    return options
}

router.post("/info/submit", (req, res) => {
    let { activityInfo } = req.body
    let { activity } = req

    let validate = validateEditActivity(activityInfo, activity.type)
    if (!validate) {
        res.json({
            code: 33001,
            message: "请完整正确填写表单信息",
        })
        return
    }
    activity.name = activityInfo.name
    activity.intro = activityInfo.intro
    let options = formatOptions(activityInfo)
    for (let k in options) {
        activity.options[k] = options[k]
        if (activity.options[k] === null) {
            delete activity.options[k]
        }
    }
    activity.markModified("options")
    activity.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "Database Error",
            })
            return
        }
        res.json({
            code: 20000,
        })
    })
})

router.delete("/remove/submit", (req, res) => {
    let { activity } = req
    activity.isUsed = false
    activity.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "Database Error",
            })
            return
        }
        let sectionID = activity.sectionID._id
        res.json({
            code: 20000,
            toPath: `/course/section/view/${sectionID}`,
        })
    })
})

router.use("/timelineProject", timeline)

export default router
