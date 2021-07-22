import Router from "express"
import File from "#models/File.js"
let router = Router()
import Mock from "mockjs"
import fs from "fs"

let section

router.use((req, res, next) => {
    section = req.section
    next()
})

router.get("/get", (req, res) => {
    section.execPopulate("files").then((s, err) => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }

        let data = {
            content: {
                files: s.files.map(e => {
                    return {
                        name: e.originalFilename,
                        size: e.size,
                        _id: e._id,
                    }
                }),
                urls: s.urls,
                activities: [],
            },
        }

        for (let i = 0; i < 3; i++) {
            data.content.activities.push(
                Mock.mock({
                    _id: "@id",
                    name: "@ctitle",
                })
            )
        }

        res.json({
            code: 20000,
            data: data,
        })
    })
})

router.post("/link/new", (req, res) => {
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
            f.isSubmitted = true
            allSave.push(
                new Promise((resolve, reject) => {
                    fs.rename(
                        `public/files/temp/${f.serverFilename}`,
                        `public/files/custom/${f.serverFilename}`,
                        err => {
                            if (err) {
                                console.log(err)
                                return reject()
                            }
                            f.save(err => {
                                if (err) {
                                    return reject()
                                }
                                resolve()
                            })
                        }
                    )
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

router.post("/link/delete", (req, res) => {
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

router.post("/file/delete", (req, res) => {
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

                file.isUsed = false
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
