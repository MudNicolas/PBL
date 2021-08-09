import Router from "express"
let router = Router()

router.get("/get", (req, res) => {
    let { stage } = req

    res.json({
        code: 20000,
        data: stage,
    })
})

export default router
