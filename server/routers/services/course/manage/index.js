import Router from "express"

import info from "./modules/info.js"
import student from "./modules/student.js"
import partner from "./modules/partner.js"
import commontTemplate from "./modules/commentTemplate.js"
import group from "./modules/group.js"

import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools/index.js"

let router = Router()

router.all("*", (req, res, next) => {
    let courseID = req.body.courseID || req.query.courseID
    CheckCourseAvailableAndReqUserHasPermission(courseID, 1, req)
        .then(course => {
            req.course = course
            next()
        })
        .catch(err => {
            res.json(err)
        })
})

router.use("/info", info)
router.use("/student", student)
router.use("/partner", partner)
router.use("/commentTemplate", commontTemplate)
router.use("/group", group)

export default router
