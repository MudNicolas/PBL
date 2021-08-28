import Router from "express"

let router = Router()

router.post("/", (req, res) => {
    let { commentData } = req
    commentData.isUsed = false
    commentData.save(err => {
        if (err) {
            res.json({
                code: 300001,
                message: "DataBase Error",
            })
            return
        }
        res.json({
            code: 20000,
        })
    })
})

export default router
