import Router from "express"

var router = Router()

import User from "#models/User.js"
import Verification from "#models/Verification.js"
import { AESEncode, AESDecode } from "#services/tools.js"

router.all("/login", (req, res, next) => {
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

        if (validateUser) {
            //console.log(validateUser.role, role)
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
            verification.save().then(t => {
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
            return
        } else {
            res.json({
                code: 60204,
                message: "用户名或密码错误",
            })
            return
        }
    })
})

router.use(async (req, res, next) => {
    let token = req.headers.token

    let dec = AESDecode(token)

    if (dec === 0) {
        res.json({
            code: 50008,
            message: "token失效，请重新登录",
        })
        return
    }
    let { uid, loginTime, role } = dec
    let loginCheck = await Verification.findOne({
        uid: uid,
        loginTime: loginTime,
        role: role,
        logout: false,
    }).then(theLogin => {
        return theLogin
    })

    if (!loginCheck) {
        res.json({
            code: 50008,
            message: "token失效，请重新登录",
        })
        return
    }

    //2小时session time
    if (Date.now() - loginCheck.latestOperationTime > 1000 * 60 * 60 * 2) {
        res.json({
            code: 50014,
            message: "您长时间未活动，请重新登陆",
        })
        return
    }

    User.findById(uid)
        .select("isUsed role")
        .then(v_user => {
            if (!v_user || !v_user.isUsed || !v_user.role.includes(role)) {
                res.json({
                    code: 60205,
                    message: "该用户或角色不存在",
                })
                return
            }
            loginCheck.latestOperationTime = new Date()
            loginCheck.save().then(() => {
                req.uid = uid
                req.role = role
                next()
            })
        })
})

//退出登录，将loginhistory的logout设为true
router.all("/logout", (req, res, next) => {
    let token = req.headers.token
    var { uid, loginTime, role } = AESDecode(token)
    Verification.findOne({
        uid: uid,
        loginTime: loginTime,
        role: role,
        logout: false,
    }).then(theLogin => {
        theLogin.logout = true
        theLogin.save().then(() => {
            res.json({
                code: 20000,
                data: "success",
            })
        })
    })
})

//对delete操作进行密码验证
router.all("*/delete", (req, res, next) => {
    let token = req.headers.token
    let dec = AESDecode(token)
    let { uid, loginTime, role } = dec
    let { password } = req.body

    Verification.findOne({
        uid: uid,
        loginTime: loginTime,
        role: role,
        logout: false,
    }).then(async v => {
        //如果传过来的值有password，更改上次验证时间
        if (password) {
            let passwordValidate = false
            passwordValidate = await User.findOne({
                _id: uid,
                password: password,
                isUsed: true,
            }).exec()
            if (!passwordValidate) {
                res.json({
                    code: 60204,
                    message: "密码错误",
                })
                return
            }
            v.dangerousOperationVerificateTime = new Date()
            v.save().then((v, err) => {})
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
})

export default router