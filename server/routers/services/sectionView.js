import Router from "express"
import Section from "#models/Section.js"
import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"
let router = Router()

let section
//验证此section的course是否具有访问权限
router.use((req, res, next) => {
    let sectionID = req.body.sectionID || req.query.sectionID
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
        CheckCourseAvailableAndReqUserHasPermission(s.courseID, 0, req)
            .then(() => {
                section = s
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
        /* files:section.files,
		urls:section.urls */
    }

    let content = []
    for (let i = 0; i < 3; i++) {
        content.push(
            Mock.mock({
                url: "url",
                name: "@ctitle",
                type: "url",
            })
        )
    }
    for (let i = 0; i < 3; i++) {
        content.push(
            Mock.mock({
                _id: "@id",
                name: "文件.2s2",
                type: "file",
            })
        )
    }

    for (let i = 0; i < 3; i++) {
        content.push(
            Mock.mock({
                _id: "@id",
                name: "@ctitle",
                type: "assignment",
            })
        )
    }
    data.content = content

    res.json({
        code: 20000,
        data: data,
    })
})

export default router
