import Router from "express"

import Section from "#models/Section.js"

let router = Router()

router.post("/", (req, res) => {
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
