import Router from "express"
let router = Router()

router.get("/get", (req, res) => {
    let { section } = req
    let data = {
        _id: section._id,
        name: section.name,
        info: section.info,
        visible: section.visible,
    }
    res.json({
        code: 20000,
        data,
    })
})

router.post("/set", (req, res) => {
    let { section } = req
    let sectionKey = Object.keys(req.body.section)

    for (let k of sectionKey) {
        section[k] = req.body.section[k]
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
