import Router from "express"

import Activity from "#models/Activity.js"

let router = Router()

function formatActivity(activity, sectionID, course) {
    let { name, type, intro, authorType, isUseCommentTemplate } = activity
    //timeline
    let { isTimeLimited, limitTime, commentTemplate, isNeedApprove } = activity
    //evaluation
    let options = {}
    let { dimensions, phaseSwitchMethod, submitLimitTime, evaluationLimitTime } = activity
    if (type === "TimeLineProject") {
        options = {
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
    }
    if (type === "Evaluation") {
        options = {
            authorType,
            phaseSwitchMethod,
            isUseCommentTemplate,
        }
        if (phaseSwitchMethod === "auto") {
            options.submitLimitTime = [new Date(submitLimitTime[0]), new Date(submitLimitTime[1])]
            options.evaluationLimitTime = [
                new Date(evaluationLimitTime[0]),
                new Date(evaluationLimitTime[1]),
            ]
        } else {
            options.phase = "submission"
        }
        if (isUseCommentTemplate) {
            let { interEvaluationTemplate } = course.toJSON()
            options.dimensions = []
            for (let ds of interEvaluationTemplate) {
                for (let d of ds.dimensions) {
                    if (dimensions.includes(d._id.toString())) {
                        options.dimensions.push(d)
                    }
                }
            }
        }
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
    let { name, type, authorType } = activity
    //timeline
    let { isTimeLimited, limitTime, isUseCommentTemplate, commentTemplate, isNeedApprove } =
        activity
    //evaluation
    let { dimensions, phaseSwitchMethod, submitLimitTime, evaluationLimitTime } = activity

    if (!name.trim()) {
        return false
    }

    if (type === "TimeLineProject") {
        if (![true, false].includes(isTimeLimited)) {
            return false
        }

        if (![true, false].includes(isUseCommentTemplate)) {
            return false
        }
        if (isUseCommentTemplate && !commentTemplate.length > 0) {
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

    if (type === "Evaluation") {
        if (!["manual", "auto"].includes(phaseSwitchMethod)) {
            return false
        }
        if (isUseCommentTemplate && !dimensions.length > 0) {
            return false
        }
        if (!["personal", "group"].includes(authorType)) {
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
    let transformData = formatActivity(activity, req.section._id, req.course)
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
