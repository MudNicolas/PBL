import Router from "express"

let router = Router()

router.use((req, res, next) => {
    let { section } = req
    let { _id } = req.body.urlData || req.body
    let range = [...section.urls, ...section.files]
    let validate = range.some(e => e._id.toString() === _id)
    if (!validate) {
        res.json({
            code: 31005,
            message: "该内容不存在",
        })
        return
    }
    next()
})

export default router
