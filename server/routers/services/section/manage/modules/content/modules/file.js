import Router from "express"
import fs from "fs"

import File from "#models/File.js"

import access from "./access.js"

let router = Router()

router.post("/submit", (req, res) => {
    let { section } = req
    let { filesID } = req.body
    let validate = filesID.every(e => {
        return /^[a-fA-F0-9]{24}$/.test(e)
    })
    if (!validate) {
        res.json({
            code: 32001,
            message: "文件ID错误",
        })
        return
    }
    File.find({
        _id: { $in: filesID },
    }).then((files, err) => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }
        let allSave = []
        files.forEach(f => {
            f.isNeeded = true
            allSave.push(
                new Promise((resolve, reject) => {
                    f.save(err => {
                        if (err) {
                            return reject()
                        }
                        resolve()
                    })
                })
            )
        })
        Promise.all(allSave)
            .then(() => {
                section.files = [...section.files, ...filesID]
                section.save(err => {
                    if (err) {
                        res.json({
                            code: 30001,
                            message: "DataBase Error",
                        })
                        return
                    }
                    res.json({
                        code: 20000,
                    })
                })
            })
            .catch(() => {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
            })
    })
})

router.use(access)

router.delete("/delete", (req, res) => {
    let { section } = req
    let { _id } = req.body
    let fileIndex = section.files.findIndex(e => e._id.toString() === _id)

    if (fileIndex > -1) {
        section.files.splice(fileIndex, 1)
    }

    File.findById(_id).then((file, err) => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }

        if (!file) {
            res.json({
                message: "不存在此文件",
            })
            return
        }

        fs.unlink(`public/files/${file.serverFilename}`, err => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }
            section.save(err => {
                if (err) {
                    res.json({
                        code: 30001,
                        message: "DataBase Error",
                    })
                    return
                }

                file.isNeeded = false
                file.save(err => {
                    if (err) {
                        res.json({
                            code: 30001,
                            message: "DataBase Error",
                        })
                        return
                    }
                    res.json({
                        code: 20000,
                    })
                })
            })
        })
    })
})

export default router
