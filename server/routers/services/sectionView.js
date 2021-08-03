import Router from "express"
import Section from "#models/Section.js"
import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"
let router = Router()

let section
//验证此section的course是否具有访问权限
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
        CheckCourseAvailableAndReqUserHasPermission(s.courseID, 0, req)
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

import Mock from "mockjs"

router.get("/get", (req, res) => {
    section.execPopulate("files").then((s, err) => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }

        let data = {
            name: s.name,
            info: s.info,
            content: {
                files: s.files.map(e => {
                    return {
                        name: e.originalFilename,
                        size: e.size,
                        _id: e._id,
                    }
                }),
                urls: s.urls,
                activities: [],
            },
        }

        for (let i = 0; i < 3; i++) {
            data.content.activities.push(
                Mock.mock({
                    _id: "@id",
                    name: "@ctitle",
                })
            )
        }

        res.json({
            code: 20000,
            data,
        })
    })
})

export default router
