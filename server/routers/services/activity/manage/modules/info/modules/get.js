import Router from "express"

let router = Router()

router.get("/", (req, res) => {
    let { activity } = req
    let { type, options, name, intro, sectionID } = activity
    sectionID = sectionID._id
    res.json({
        code: 20000,
        data: {
            type,
            options,
            name,
            intro,
            sectionID,
        },
    })
})

export default router
