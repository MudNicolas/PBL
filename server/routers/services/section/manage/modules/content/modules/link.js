import Router from "express"

import access from "./access.js"

let router = Router()

router.post("/new", (req, res) => {
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

router.use(access)

router.post("/edit", (req, res) => {
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

router.delete("/delete", (req, res) => {
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

export default router
