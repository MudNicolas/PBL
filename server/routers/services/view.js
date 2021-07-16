import Router from "express"
import Course from "#models/Course.js"
import { COVER_PATH } from "#root/settings.js"

import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"

var router = Router()

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
    CheckCourseAvailableAndReqUserHasPermission(courseID, 0, req)
        .then(() => {
            next()
        })
        .catch(err => {
            res.json(err)
        })
})

router.get("/get", (req, res, next) => {
    let courseID = req.query.courseID
    Course.findById(courseID)
        .select("name introduction chiefTeacher partnerTeacher cover")
        .populate("chiefTeacher", "name")
        .populate("partnerTeacher", "name")
        .then((course, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }

            course.cover = `${COVER_PATH}/${course.cover}`

            let sections = []

            res.json({
                code: 20000,
                data: {
                    course: course,
                    sections: sections,
                },
            })
        })
})

export default router
