import Router from "express"

let router = Router()

router.get("/get", (req, res) => {
    let { activity } = req
    let { type } = activity
    res.json({
        code: 20000,
        data: { type },
    })
})

export default router
