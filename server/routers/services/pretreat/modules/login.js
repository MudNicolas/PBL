import Router from "express"

import User from "#models/User.js"
import Verification from "#models/Verification.js"

import { AESEncode } from "#services/tools/index.js"

let router = Router()

router.post("/", (req, res, next) => {
    var username = req.body.username
    var password = req.body.password
    var role = req.body.role
    User.findOne({
        username: username,
        password: password,
        isUsed: true,
    }).then((validateUser, err) => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }

        if (!validateUser) {
            res.json({
                code: 60204,
                message: "用户名或密码错误",
            })
            return
        }
        //console.log(validateUser.role, role)

        if (validateUser.role.includes("root")) {
            role = "root"
        }

        if (!validateUser.role.includes(role)) {
            res.json({
                code: 60205,
                message: "该用户无此角色",
            })
            return
        }

        let verification = new Verification({
            uid: validateUser._id,
            loginTime: new Date(),
            latestOperationTime: new Date(),
            role: role,
        })
        verification.save((err, t) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }
            var token = AESEncode({
                uid: t.uid,
                loginTime: t.loginTime,
                role: t.role,
            })
            //返回token
            res.json({
                code: 20000,
                data: { token: token },
            })
            return
        })
    })
})

export default router
