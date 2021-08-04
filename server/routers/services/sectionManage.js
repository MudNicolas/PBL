import Router from "express"
import Section from "#models/Section.js"
import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"

let router = Router()

/**
 * @req.section section
 * @req.course course
 */

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
        CheckCourseAvailableAndReqUserHasPermission(s.courseID, 1, req)
            .then(course => {
                req.section = s
                req.course = course

                next()
            })
            .catch(err => {
                res.json(err)
            })
    })
})

import info from "./modules/sectionManage/info.js"
import content from "./modules/sectionManage/content.js"
router.use("/info", info)
router.use("/content", content)

router.delete("/delete", (req, res) => {
    let { section } = req
    section.isUsed = false
    section.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }
        res.json({
            code: 20000,
            toPath: `/course/view/${section.courseID}`,
        })
    })
})

router.get("/activity/commentTemplate/get", (req, res) => {
    let { commentTemplate } = req.course
    let filterTemplate = commentTemplate.filter(e => {
        if (e.isUsed) {
            return {
                _id: e._id,
                name: e.name,
                template: e.template,
            }
        }
    })
    res.json({
        code: 20000,
        data: filterTemplate,
    })
})

router.post("/activity/commentTemplate/new", (req, res) => {
    let { template } = req.body
    let temp = template.entry
    let uniqueTemp = new Set(temp)
    if (uniqueTemp.size !== temp.length) {
        res.json({
            code: 31001,
            message: "存在重复条目",
        })
        return
    }

    let { course } = req
    course.commentTemplate.push({
        name: template.name,
        template: temp,
    })
    course.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }
        res.json({
            code: 20000,
        })
    })
})

export default router
