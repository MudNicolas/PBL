import Router from "express"

let router = Router()

router.get("/get", (req, res, next) => {
    let user = req.targetUser
    let { name, introduction, avatar, _id } = user
    let data = { name, introduction, avatar, _id }

    res.json({
        code: 20000,
        data,
    })
})

export default router
