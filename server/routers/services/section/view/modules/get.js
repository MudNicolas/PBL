import Router from "express"

import Activity from "#models/Activity.js"

let router = Router()

router.get("/", (req, res) => {
    let { section } = req
    section.execPopulate("files").then(async (s, err) => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }

        let data = {
            name: s.name,
            info: s.info,
            content: {
                files: s.files.map(e => {
                    return {
                        name: e.originalFilename,
                        size: e.size,
                        _id: e._id,
                    }
                }),
                urls: s.urls,
                activities: await Activity.find({
                    sectionID: s._id,
                    isUsed: true,
                })
                    .select(["_id", "name", "type"])
                    .exec(),
            },
        }

        res.json({
            code: 20000,
            data,
        })
    })
})

export default router
