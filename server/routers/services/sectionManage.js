import Router from "express"
let router = Router()

let section

router.use((req, res, next) => {
    section = req.section
    next()
})

import info from "./modules/sectionManage/info.js"
import content from "./modules/sectionManage/content.js"
router.use("/info", info)
router.use("/content", content)

router.post("/delete", (req, res) => {
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
