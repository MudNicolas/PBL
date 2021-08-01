import Router from "express"
import Section from "#models/Section.js"
import sectionView from "#services/sectionView.js"
import { CheckCourseAvailableAndReqUserHasPermission } from "#services/tools.js"

let router = Router()

router.use("/view", sectionView)

//教师api

//确定section的Api
import manage from "./sectionManage.js"
router.use("/manage", manage)

//给多个sectin和无sectionID情况下的api
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
    s.save(err => {
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
            s.save(err => {
                if (err) {
                    return reject(err)
                }
                resolve()
            })
        })
    }
})

export default router
