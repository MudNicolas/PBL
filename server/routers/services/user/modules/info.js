import Router from "express"

let router = Router()

router.get("/get", (req, res) => {
    let user = req.targetUser
    let { name, avatar, introduction, username, _id } = user
    let data = {
        name,
        avatar,
        introduction,
        username,
        roles: [req.role],
        _id,
    }
    res.json({
        data,
        code: 20000,
    })
})

router.post("/change", async (req, res) => {
    let user = req.targetUser
    let name = req.body.name.trim()
    let introduction = req.body.introduction.trim()
    user.name = name
    user.introduction = introduction
    user.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error!",
            })
            return
        }

        res.json({
            data: {
                name,
                introduction,
            },
            code: 20000,
        })
    })
})

export default router
