import Router from "express"

import User from "#models/User.js"

let router = Router()

router.use((req, res, next) => {
    let _id = req.query.uid || req.uid
    let validate = /^[a-fA-F0-9]{24}$/.test(_id)
    if (!validate) {
        res.json({
            code: 30002,
            message: "该用户不存在",
        })
        return
    }
    User.findById(_id).then((user, err) => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error!",
            })
            return
        }
        if (!user) {
            res.json({
                code: 30002,
                message: "该用户不存在",
            })
            return
        }
        req.targetUser = user
        next()
    })
})

export default router
