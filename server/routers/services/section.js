import Router from "express"
import Course from "#models/Course.js"
import Section from "#models/Section.js"
import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"

let router = Router()

//教师api
router.use((req, res, next) => {
    let { courseID } = req.body
    CheckCourseAvailableAndReqUserHasPermission(courseID, 1, req)
        .then(() => {
            next()
        })
        .catch(err => {
            res.json(err)
        })
})

router.post("/create", async (req, res) => {
    let { courseID, section } = req.body
    let index = await Section.countDocuments({
        courseID: courseID,
    }).exec()
    let s = new Section({
        name: section.name,
        info: section.info,
        date: new Date(),
        visible: section.visible,
        isUsed: true,
        courseID: courseID,
        index: index,
    })
    s.save().then((sec, err) => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }
        res.json({
            code: 20000,
            data: {
                sectionID: sec._id,
            },
        })
    })
})

router.post("/sort", (req, res) => {
    let { courseID, sectionIDs } = req.body
    Section.find({
        courseID: courseID,
        isUsed: true,
    })
        .select("index")
        .then((sections, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }

            let filterSections = sections.filter(s => sectionIDs.indexOf(s._id.toString()) > -1)

            let saveList = []
            filterSections.forEach(s => {
                s.index = sectionIDs.indexOf(s._id.toString())
                saveList.push(saveChange(s))
            })
            Promise.all(saveList)
                .then(() => {
                    res.json({
                        code: 20000,
                    })
                })
                .catch(() => {
                    res.json({
                        code: 30001,
                        message: "DataBase Error",
                    })
                })
        })

    function saveChange(s) {
        return new Promise((resolve, reject) => {
            s.save().then((ns, err) => {
                if (err) {
                    return reject(err)
                }
                resolve()
            })
        })
    }
})

router.post("/delete", (req, res) => {
    res.end()
})

export default router
