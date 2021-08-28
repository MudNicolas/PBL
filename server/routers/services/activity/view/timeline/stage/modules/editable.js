import Router from "express"

let router = Router()

router.use((req, res, next) => {
    let { stage } = req
    let { editable } = stage
    if (!editable) {
        res.json({
            message: "该阶段已不可编辑",
        })
        return
    }
    next()
})

export default router
