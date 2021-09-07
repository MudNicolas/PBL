import Router from "express"
let router = Router()

//限时控制
router.post("*", (req, res, next) => {
    let { activity } = req

    if (activity.options.isTimeLimited) {
        let limitTime = activity.options.limitTime
        if (new Date() < new Date(limitTime[0]) || new Date() > new Date(limitTime[1])) {
            res.json({
                message: "当前已不在限定时间内",
            })
            return
        }
    }
    next()
})

export default router
