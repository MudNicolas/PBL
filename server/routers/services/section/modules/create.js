import Router from "express"

import Section from "#models/Section.js"

let router = Router()

router.post("/", async (req, res) => {
    let { courseID, section } = req.body
    let index = await Section.countDocuments({
        courseID: courseID,
    }).exec()
    let s = new Section({
        name: section.name,
        info: section.info,
        date: new Date(),
        visible: section.visible,
        isUsed: true,
        courseID: courseID,
        index: index,
    })
    s.save(err => {
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
