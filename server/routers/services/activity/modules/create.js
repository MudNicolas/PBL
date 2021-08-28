import Router from "express"

import Activity from "#models/Activity.js"

let router = Router()

function formatActivity(activity, sectionID) {
    let {
        name,
        type,
        intro,
        authorType,
        isTimeLimited,
        limitTime,
        isUseCommentTemplate,
        commentTemplate,
        isNeedApprove,
    } = activity
    let options = {
        authorType,
        isTimeLimited,
        isUseCommentTemplate,
        isNeedApprove,
    }
    if (isTimeLimited) {
        options.limitTime = [new Date(limitTime[0]), new Date(limitTime[1])]
    }
    if (isUseCommentTemplate) {
        options.commentTemplate = commentTemplate
    }
    return {
        name,
        intro,
        options,
        type,
        sectionID,
    }
}

function validateActivity(activity) {
    let {
        name,
        type,
        authorType,
        isTimeLimited,
        limitTime,
        isUseCommentTemplate,
        commentTemplate,
        isNeedApprove,
    } = activity

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
        if (isUseCommentTemplate && !commentTemplate) {
            return false
        }
        if (!["personal", "group"].includes(authorType)) {
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

        if (![true, false].includes(isNeedApprove)) {
            return false
        }
        return true
    }
    return false
}

router.post("/", (req, res) => {
    let { activity } = req.body
    let validate = validateActivity(activity)
    if (!validate) {
        res.json({
            code: 33001,
            message: "请完整正确填写表单信息",
        })
        return
    }
    let transformData = formatActivity(activity, req.section._id)
    let newActivity = new Activity(transformData)
    newActivity.markModified("options")
    newActivity.save((err, _a) => {
        if (err) {
            res.json({
                code: 30001,
                message: "Database Error",
            })
            return
        }
        res.json({
            code: 20000,
            data: {
                activityID: _a._id,
            },
        })
    })
})

export default router
