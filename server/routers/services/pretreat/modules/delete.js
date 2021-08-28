import Router from "express"

import User from "#models/User.js"

let router = Router()

//对delete操作进行密码验证
router.delete("*", async (req, res, next) => {
    let { password } = req.body

    let v = req.loginInfo
    //如果传过来的值有password，更改上次验证时间
    if (password) {
        let passwordValidate = await User.findOne({
            _id: req.uid,
            password: password,
        }).exec()
        if (!passwordValidate) {
            res.json({
                code: 60204,
                message: "密码错误",
            })
            return
        }
        v.dangerousOperationVerificateTime = new Date()
        v.save(err => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }
        })
    }

    //未验证密码或距上一次验证超过30分钟
    let valid =
        v.dangerousOperationVerificateTime &&
        Date.now() - v.dangerousOperationVerificateTime < 1000 * 60 * 30
    if (!valid) {
        res.json({
            code: 1023,
            message: "需要验证身份",
            data: {
                url: req.url,
                params: req.body,
            },
        })
        return
    }
    next()
})

export default router
