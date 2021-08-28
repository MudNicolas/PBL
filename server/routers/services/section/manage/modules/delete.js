import Router from "express"

let router = Router()

router.delete("/", (req, res) => {
    let { section } = req
    section.isUsed = false
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
            toPath: `/course/view/${section.courseID}`,
        })
    })
})

export default router
