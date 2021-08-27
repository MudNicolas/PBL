import Router from "express"

let router = Router()

//退出登录，将loginhistory的logout设为true
router.post("/", (req, res) => {
    let theLogin = req.loginInfo
    theLogin.logout = true
    theLogin.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }
        res.json({
            code: 20000,
            data: "success",
        })
    })
})

export default router
