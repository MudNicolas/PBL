import Router from "express"
import fs from "fs"

import { UploadImg } from "#services/tools/index.js"

let router = Router()

router.post("/upload", (req, res) => {
    UploadImg("avatar", req)
        .then(data => {
            let avatarFilename = data

            let user = req.targetUser
            let oldAvatar = user.avatar

            user.avatar = avatarFilename
            user.save(err => {
                if (err) {
                    res.json({
                        code: 30001,
                        message: "DataBase Error!",
                    })
                    return
                }
                if (oldAvatar && oldAvatar !== "default.gif") {
                    fs.unlink("public/img/avatar/" + oldAvatar, err => {
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
            })
        })
        .catch(err => {
            console.log(err)
            res.json({
                code: 30001,
                message: "Error!",
            })
            return
        })
})

export default router
