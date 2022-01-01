import Router from "express"

import Section from "#models/Section.js"

import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools/index.js"

let router = Router()

router.use((req, res, next) => {
    let sectionID = req.body.sectionID
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
                console.log(err)
                res.json(err)
            })
    })
})

export default router
