import Router from "express"

let router = Router()

router.get("/get", (req, res) => {
    let { activity } = req
    let { type, name, intro, options } = activity
    res.json({
        code: 20000,
        data: { type, name, intro, options },
    })
})

export default router
