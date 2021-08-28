import Router from "express"

let router = Router()

router.use((req, res, next) => {
    if (req.role !== "teacher") {
        res.json({
            code: 401,
        })
        return
    }
    next()
})

export default router
