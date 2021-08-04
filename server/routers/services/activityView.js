import Activity from "#models/Activity.js"
import Router from "express"
let router = Router()
import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"

router.use((req, res, next) => {
    let activityID = req.body.activityID || req.query.activityID

    let validate = /^[a-fA-F0-9]{24}$/.test(activityID)
    if (!validate) {
        res.json({
            code: 404,
            message: "error",
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
                    message: "error",
                })
                return
            }
            CheckCourseAvailableAndReqUserHasPermission(acti.sectionID.courseID, 0, req)
                .then(() => {
                    req.activity = acti
                    next()
                })
                .catch(err => {
                    res.json(err)
                })
        })
})

router.get("/get", (req, res) => {
    let { activity } = req
})

export default router
