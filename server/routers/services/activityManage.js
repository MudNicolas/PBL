import Router from "express"
let router = Router()
import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"
import Activity from "#models/Activity.js"

router.use((req, res, next) => {
    let activityID = req.body.activityID || req.query.activityID
    let validate = /^[a-fA-F0-9]{24}$/.test(activityID)
    if (!validate) {
        res.json({
            code: 404,
            message: "不存在此活动",
        })
        return
    }
    Activity.findOne({
        _id: activityID,
        isUsed: true,
    })
        .populate({
            path: "sectionID",
            select: "courseID",
        })
        .then((acti, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }
            if (!acti) {
                res.json({
                    code: 404,
                    message: "不存在此活动",
                })
                return
            }
            CheckCourseAvailableAndReqUserHasPermission(acti.sectionID.courseID, 1, req)
                .then(c => {
                    req.activity = acti
                    req.course = c
                    req.courseID = c._id
                    req.sectionID = acti.sectionID
                    next()
                })
                .catch(err => {
                    res.json(err)
                })
        })
})

router.get("/type/get", (req, res) => {
    let { activity } = req
    let { type } = activity
    res.json({
        code: 20000,
        data: { type },
    })
})

router.get("/info/get", (req, res) => {
    let { activity } = req
    let { type, options, name, intro, sectionID } = activity
    sectionID = sectionID._id
    console.log(options)
    res.json({
        code: 20000,
        data: {
            type,
            options,
            name,
            intro,
            sectionID,
        },
    })
})

export default router
