import Router from "express"
let router = Router()
import Mock from "mockjs"

let section

router.use((req, res, next) => {
    section = req.section
    next()
})

router.get("/get", (req, res) => {
    let content = []
    let { urls, files } = section
    let formatUrls = urls.map(e => {
        return {
            _id: e._id,
            name: e.name,
            type: "url",
            url: e.url,
        }
    })
    content = [...content, ...formatUrls]

    res.json({
        code: 20000,
        data: content,
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

router.post("/delete", (req, res) => {
    let { _id } = req.body
    let urlIndex = section.urls.findIndex(e => e._id.toString() === _id)
    let fileIndex = section.urls.findIndex(e => e._id.toString() === _id)

    if (urlIndex > -1) {
        section.urls.splice(urlIndex, 1)
    } else {
        section.files.splice(fileIndex, 1)
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

export default router
