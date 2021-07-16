import Router from "express"
import fs from "fs"
import User from "#models/User.js"
import { UploadImg } from "#services/tools.js"

var router = Router()

router.get("/info", (req, res, next) => {
    var _id = req.uid
    User.findById(_id).then(userInfo => {
        res.json({
            data: {
                name: userInfo.name,
                avatar: userInfo.avatar,
                introduction: userInfo.introduction,
                username: userInfo.username,
                roles: [req.role],
                _id: _id,
            },
            code: 20000,
        })
    })
})

router.post("/changeInfo", async (req, res, next) => {
    var _id = req.uid
    var name = req.body.name.trim()
    var introduction = req.body.introduction.trim()
    User.findByIdAndUpdate(
        _id,
        {
            name: name,
            introduction: introduction,
        },
        {
            new: true,
        },
        (err, u) => {
            if (err) {
                console.log(err)
                res.json({
                    code: 30001,
                    message: "DataBase Error!",
                })
                return
            }

            res.json({
                data: {
                    name: u.name,
                    introduction: u.introduction,
                },
                code: 20000,
            })
            return
        }
    )
})

router.post("/uploadAvatar", (req, res, next) => {
    UploadImg("avatar", req)
        .then(data => {
            let avatarFilename = data

            User.findOneAndUpdate(
                {
                    _id: req.uid,
                },
                {
                    $set: {
                        avatar: avatarFilename,
                    },
                },
                (err, result) => {
                    if (err) {
                        console.log("/user/uploadAvatar", err)
                        res.json({
                            code: 30001,
                            message: "DataBase Error!",
                        })
                        return
                    }
                    if (result.avatar && result.avatar !== "default.gif") {
                        fs.unlink("public/img/avatar/" + result.avatar, err => {
                            if (err) {
                                console.log("uploadAvatar fs err")
                            }
                            return
                        })
                    }
                    res.json({
                        code: 20000,
                        data: {
                            avatar: avatarFilename,
                        },
                    })
                }
            )
        })
        .catch(err => {
            res.json({
                code: 30001,
                message: "MultiParty Error!",
            })
            return
        })
})

router.post("/updatePWD", async (req, res, next) => {
    var cur = req.body.cur
    var n = req.body.n
    var uid = req.uid
    var checkCurrentPWD = await User.findById(uid).then(user => {
        return user.password == cur
    })
    if (!checkCurrentPWD) {
        res.json({
            code: 30002,
            message: "当前密码输入错误",
        })
        return
    }
    User.updateOne(
        {
            _id: uid,
        },
        {
            password: n,
        },
        err => {
            if (err) {
                console.log("/user/updatepassword", err)
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
            return
        }
    )
})

router.post("/getProfilePopoverInfo", (req, res, next) => {
    let { uid } = req.body
    User.findById(uid)
        .select("name introduction avatar")
        .then((user, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error!",
                })
                return
            }
            res.json({
                code: 20000,
                data: {
                    profileInfo: user,
                },
            })
        })
})

export default router
