import Router from "express"
let router = Router()
import { checkCourseAvailableAndReqUserHasPermission } from "#services/tools.js"

router.all("*", (req, res, next) => {
    let courseID = req.body.courseID || req.query.courseID
    let validate = /^[a-fA-F0-9]{24}$/.test(courseID)
    if (!validate) {
        res.json({
            code: 404,
            message: "error",
        })
        return
    }

    checkCourseAvailableAndReqUserHasPermission(courseID, 1, req)
        .then(() => {
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
