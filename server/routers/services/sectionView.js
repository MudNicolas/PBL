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
    let data = {
        name: section.name,
        info: section.info,
        content: {
            files: [],
            urls: section.urls,
            activities: [],
        },
    }

    for (let i = 0; i < 3; i++) {
        data.content.files.push(
            Mock.mock({
                _id: "@id",
                name: "文件.pptx",
            })
        )
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
        data: data,
    })
})

export default router
