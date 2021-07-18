import Router from "express"
import Course from "#models/Course.js"
import Section from "#models/Section.js"
import { COVER_PATH } from "#root/settings.js"

import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"

var router = Router()

router.all("*", (req, res, next) => {
    let courseID = req.body.courseID || req.query.courseID

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
        .then(async (course, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }

            course.cover = `${COVER_PATH}/${course.cover}`

            let sections = await Section.find({
                courseID: courseID,
                isUsed: true,
            })
                .sort({
                    index: 1,
                })
                .select("visible name info")
                .exec()

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
