import Router from "express"

let router = Router()

router.use((req, res, next) => {
    let { commentData } = req
    if (commentData.commentUser.toString() !== req.uid.toString()) {
        res.json({
            code: 401,
        })
        return
    }
    next()
})

export default router
