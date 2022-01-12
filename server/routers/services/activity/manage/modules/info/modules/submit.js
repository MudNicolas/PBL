import Router from "express"

let router = Router()

function validateEditActivity(activity, type) {
    let { name, isTimeLimited, limitTime, isUseCommentTemplate, commentTemplate } = activity
    let { phaseSwitchMethod, submitLimitTime, evaluationLimitTime, phase } = activity
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
    if (type === "Evaluation") {
        if (!["manual", "auto"].includes(phaseSwitchMethod)) {
            return false
        }

        if (phaseSwitchMethod === "auto") {
            if (
                !submitLimitTime[0] ||
                !submitLimitTime[1] ||
                new Date(submitLimitTime[0]).toString() === "Invalid Date" ||
                new Date(submitLimitTime[1]).toString() === "Invalid Date" ||
                new Date(submitLimitTime[0]) > new Date(submitLimitTime[1]) ||
                !evaluationLimitTime[0] ||
                !evaluationLimitTime[1] ||
                new Date(evaluationLimitTime[0]).toString() === "Invalid Date" ||
                new Date(evaluationLimitTime[1]).toString() === "Invalid Date" ||
                new Date(evaluationLimitTime[0]) > new Date(evaluationLimitTime[1])
            )
                return false
        } else {
            if (!["submission", "evaluation", "end"].includes(phase)) {
                return false
            }
        }

        return true
    }
    return false
}

function formatOptions(activityInfo, type) {
    let { isTimeLimited, limitTime, isUseCommentTemplate, commentTemplate } = activityInfo
    let { phaseSwitchMethod, submitLimitTime, evaluationLimitTime, phase } = activityInfo

    let options = {}
    if (type === "TimeLineProject") {
        options = {
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
    }
    if (type === "Evaluation") {
        options = { phaseSwitchMethod }
        if (phaseSwitchMethod === "auto") {
            options.submitLimitTime = submitLimitTime
            options.evaluationLimitTime = evaluationLimitTime
        } else {
            options.phase = phase
        }
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
    let options = formatOptions(activityInfo, activity.type)
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
