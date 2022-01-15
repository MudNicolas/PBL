import Router from "express"

var router = Router()

router.use((req, res, next) => {
    let { role } = req
    if (["admin", "root"].includes(role)) {
        next()
    } else {
        res.json({ code: 401 })
    }
})

export default router
