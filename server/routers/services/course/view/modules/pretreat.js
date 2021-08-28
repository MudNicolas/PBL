import Router from "express"

import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools/index.js"

var router = Router()

router.use((req, res, next) => {
    let courseID = req.body.courseID || req.query.courseID

    CheckCourseAvailableAndReqUserHasPermission(courseID, 0, req)
        .then(c => {
            req.course = c
            next()
        })
        .catch(err => {
            res.json(err)
        })
})

export default router
