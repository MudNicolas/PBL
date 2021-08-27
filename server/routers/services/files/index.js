import Router from "express"
import fs from "fs"

import File from "#models/File.js"

import { UploadFiles } from "#services/tools/index.js"

let router = Router()

router.post("/upload", (req, res) => {
    UploadFiles(req)
        .then(uploadFile => {
            let file = new File({
                originalFilename: uploadFile.originalFilename,
                serverFilename: uploadFile.path.split("\\")[uploadFile.path.split("\\").length - 1],
                submitUID: req.uid,
                size: uploadFile.size,
                uploadTime: Date.now(),
                type: "file",
            })
            file.save((err, f) => {
                if (err) {
                    console.log(err)
                    res.json({
                        code: 30001,
                        message: "DataBase Error",
                    })
                    return
                }
                res.json({
                    code: 20000,
                    _id: f._id,
                })
            })
        })
        .catch(err => {
            res.json({
                code: 30001,
                message: "MultiParty Error!",
            })
        })
})

router.get("/download", (req, res) => {
    fileCheck(req)
        .then(file => {
            let path = "public/files/"

            let downloadPath = path + file.serverFilename
            fs.access(downloadPath, err => {
                if (err) {
                    res.send(err)
                    return
                }
                res.download(downloadPath, file.originalFilename)
            })
        })
        .catch(err => {
            res.send(err)
        })
})

router.get("/access", (req, res) => {
    fileCheck(req)
        .then(() => {
            res.json({ code: 20000 })
        })
        .catch(err => {
            res.json(err)
        })
})

function fileCheck(req) {
    return new Promise((resolve, reject) => {
        let _id = req.query._id
        let validate = /^[a-fA-F0-9]{24}$/.test(_id)
        if (!validate) {
            return reject({
                code: 30002,
                message: "该文件不存在",
            })
        }
        File.findOne({
            _id: _id,
            isUsed: true,
        }).then((file, err) => {
            if (err) {
                return reject({
                    code: 30001,
                    message: "DataBase Error",
                })
            }
            if (!file) {
                return reject({
                    code: 30002,
                    message: "该文件不存在",
                })
            }

            let path = `public/files/${file.serverFilename}`

            fs.access(path, err => {
                if (err) {
                    return reject({
                        code: 30002,
                        message: "服务器发生错误，该文件不存在",
                    })
                }
                resolve(file)
            })
        })
    })
}

export default router
