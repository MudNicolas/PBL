import Router from "express"
let router = Router()
import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"
import Activity from "#models/Activity.js"

router.use((req, res, next) => {
    let activityID = req.body.activityID || req.query.activityID
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
            CheckCourseAvailableAndReqUserHasPermission(acti.sectionID.courseID, 1, req)
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

export default router
