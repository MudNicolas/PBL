import Router from "express"
import File from "#models/File.js"
let router = Router()
import { UploadFiles } from "#services/tools.js"
import fs, { exists } from "fs"

router.post("/upload", (req, res) => {
    UploadFiles(req)
        .then(uploadFile => {
            let file = new File({
                originalFilename: uploadFile.originalFilename,
                serverFilename: uploadFile.path.split("\\")[uploadFile.path.split("\\").length - 1],
                submitUID: req.uid,
                size: uploadFile.size,
                uploadTime: Date.now(),
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
            let path
            if (file.isSubmitted) {
                path = "public/files/"
            } else {
                path = "public/files/temp/"
            }

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
        File.findById(_id).then((file, err) => {
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
            resolve(file)
        })
    })
}

export default router
