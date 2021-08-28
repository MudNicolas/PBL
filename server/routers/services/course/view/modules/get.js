import Router from "express"

import Section from "#models/Section.js"

import { COVER_PATH } from "#root/settings.js"

var router = Router()

router.get("/", (req, res, next) => {
    let { course } = req
    let courseID = req.query.courseID

    course
        .execPopulate([
            { path: "chiefTeacher", select: "name" },
            { path: "partnerTeacher", select: "name" },
        ])
        .then(async (c, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }
            let theCourse = {
                name: c.name,
                introduction: c.introduction,
                chiefTeacher: c.chiefTeacher,
                partnerTeacher: c.partnerTeacher,
                cover: c.cover,
            }

            theCourse.cover = `${COVER_PATH}/${theCourse.cover}`

            let query = {
                courseID: courseID,
                isUsed: true,
            }
            if (req.role === "student") {
                query.visible = true
            }

            let sections = await Section.find(query)
                .sort({
                    index: 1,
                })
                .select("visible name info")
                .exec()

            res.json({
                code: 20000,
                data: {
                    course: theCourse,
                    sections,
                },
            })
        })
})

export default router
