import Router from "express"

import Section from "#models/Section.js"
import Activity from "#models/Activity.js"

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
                .select({
                    visible: 1,
                    name: 1,
                    info: 1,
                    urls: 1,
                    files: 1,
                })
                .populate({
                    path: "files",
                    select: {
                        originalFilename: 1,
                        _id: 0,
                    },
                })
                .then(async r => {
                    let result = []
                    for (let section of r) {
                        let activities = await Activity.find({ sectionID: section._id })
                            .select({ name: 1, _id: 0 })
                            .then(a => {
                                return a.map(e => e.name)
                            })
                        result.push({
                            _id: section._id,
                            name: section.name,
                            info: section.info,
                            visible: section.visible,
                            urls: section.urls.map(e => e.name),
                            files: section.files.map(e => e.originalFilename),
                            activities,
                        })
                    }
                    return result
                })

            //console.log(sections)

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
