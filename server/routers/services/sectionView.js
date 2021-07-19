import Router from "express"
import Section from "#models/Section.js"
let router = Router()

//验证此section的course是否具有访问权限
router.use((req, res, next) => {
    let { sectionID } = req.body || req.query
    let validate = /^[a-fA-F0-9]{24}$/.test(_id)
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
    })
        .select("courseID")
        .then((s, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }
            CheckCourseAvailableAndReqUserHasPermission(s.courseID, 0, req)
                .then(() => {
                    next()
                })
                .catch(err => {
                    res.json(err)
                })
        })
})

router.get("/get", (req, res) => {
    let { sectionID } = req.query
})

export default router
