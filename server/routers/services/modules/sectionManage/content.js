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
    let formatLinks = links.map(e => {
        e.url = "http://" + e.url
        return e
    })
    section.urls = section.urls.concat(formatLinks)
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
