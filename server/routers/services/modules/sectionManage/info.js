import Router from "express"
let router = Router()

let section
router.use((req, res, next) => {
    section = req.section
    next()
})

router.get("/get", (req, res) => {
    let data = {
        _id: section._id,
        name: section.name,
        info: section.info,
        visible: section.visible,
    }
    res.json({
        code: 20000,
        data: data,
    })
})

router.post("/set", (req, res) => {
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
