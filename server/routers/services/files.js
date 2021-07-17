import Router from "express"
import File from "#models/File.js"
let router = Router()
import { UploadFiles } from "#services/tools.js"

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
            file.save().then((f, err) => {
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

export default router
