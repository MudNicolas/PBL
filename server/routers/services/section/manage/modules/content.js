import Router from "express"
import fs from "fs"

import File from "#models/File.js"
import Activity from "#models/Activity.js"

let router = Router()

router.get("/get", (req, res) => {
    let { section } = req
    section.execPopulate("files").then(async (s, err) => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }

        let data = {
            name: s.name,
            info: s.info,
            content: {
                files: s.files.map(e => {
                    return {
                        name: e.originalFilename,
                        size: e.size,
                        _id: e._id,
                    }
                }),
                urls: s.urls,
                activities: await Activity.find({
                    sectionID: s._id,
                })
                    .select(["_id", "name", "type"])
                    .exec(),
            },
        }

        res.json({
            code: 20000,
            data,
        })
    })
})

router.post("/link/new", (req, res) => {
    let { section } = req
    let { links } = req.body

    section.urls = section.urls.concat(links)
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

router.post("/file/submit", (req, res) => {
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

router.use((req, res, next) => {
    let { section } = req
    let { _id } = req.body.urlData || req.body
    let range = [...section.urls, ...section.files]
    let validate = range.some(e => e._id.toString() === _id)
    if (!validate) {
        res.json({
            code: 31005,
            message: "该内容不存在",
        })
        return
    }
    next()
})

router.post("/link/edit", (req, res) => {
    let { section } = req
    let { urlData } = req.body

    for (let i of section.urls) {
        if (i._id.toString() === urlData._id) {
            i.name = urlData.name
            i.url = urlData.url
            break
        }
    }
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

router.delete("/link/delete", (req, res) => {
    let { section } = req
    let { _id } = req.body
    let urlIndex = section.urls.findIndex(e => e._id.toString() === _id)

    if (urlIndex > -1) {
        section.urls.splice(urlIndex, 1)
    }
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

router.delete("/file/delete", (req, res) => {
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

        fs.unlink(`public/files/custom/${file.serverFilename}`, err => {
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
