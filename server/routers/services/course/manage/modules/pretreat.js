import Router from "express"

import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools/index.js"

let router = Router()

router.use((req, res, next) => {
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

export default router
