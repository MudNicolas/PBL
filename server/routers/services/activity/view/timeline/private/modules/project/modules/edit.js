import Router from "express"

let router = Router()

router.post("/", (req, res) => {
    let { project } = req
    let { editData } = req.body
    let { name, intro } = editData
    project.intro = intro
    project.name = name.trim()
    project.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "Database Error",
            })
            return
        }
        res.json({
            code: 20000,
        })
    })
})

export default router
