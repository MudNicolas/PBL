import Router from "express"
import Section from "#models/Section.js"
import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"

let router = Router()

let section

router.use((req, res, next) => {
    let sectionID = req.body.sectionID || req.query.sectionID || req.body.section._id

    let validate = /^[a-fA-F0-9]{24}$/.test(sectionID)
    if (!validate) {
        res.json({
            code: 404,
            message: "error",
        })
        return
    }
    Section.findOne({
        _id: sectionID,
        isUsed: true,
    }).then((s, err) => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }
        if (!s) {
            res.json({
                code: 404,
                message: "error",
            })
            return
        }
        CheckCourseAvailableAndReqUserHasPermission(s.courseID, 1, req)
            .then(() => {
                section = s
                req.section = s

                next()
            })
            .catch(err => {
                res.json(err)
            })
    })
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
