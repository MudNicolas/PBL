import Router from "express"

let router = Router()

router.post("/update", async (req, res, next) => {
    var cur = req.body.cur
    var n = req.body.n

    let user = req.targetUser

    if (user.password !== cur) {
        res.json({
            code: 30002,
            message: "当前密码输入错误",
        })
        return
    }

    user.password = n

    user.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error!",
            })
            return
        }
        res.json({
            code: 20000,
            message: "密码修改成功！请重新登录",
        })
    })
})

export default router
