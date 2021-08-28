import Router from "express"

let router = Router()

router.delete("/submit", (req, res) => {
    let { activity } = req
    activity.isUsed = false
    activity.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "Database Error",
            })
            return
        }
        let sectionID = activity.sectionID._id
        res.json({
            code: 20000,
            toPath: `/course/section/view/${sectionID}`,
        })
    })
})

export default router
