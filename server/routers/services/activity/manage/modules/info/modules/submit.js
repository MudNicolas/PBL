import Router from "express"

let router = Router()

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

router.post("/", (req, res) => {
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

export default router
