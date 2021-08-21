import Router from "express"
let router = Router()
import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"

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

import info from "./modules/courseManage/info.js"
import student from "./modules/courseManage/student.js"
import partner from "./modules/courseManage/partner.js"
import commontTemplate from "./modules/courseManage/commentTemplate.js"
import group from "./modules/courseManage/group.js"

router.use("/info", info)
router.use("/student", student)
router.use("/partner", partner)
router.use("/commentTemplate", commontTemplate)
router.use("/group", group)

export default router
