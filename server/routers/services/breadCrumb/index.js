import Router from "express"

import generateBreadCrumb from "./modules/generator.js"

var router = Router()

router.get("/get", async (req, res, next) => {
    let _id = req.query._id
    let name = req.query.name
    //console.log(params)
    let breadCrumb = []

    breadCrumb = await generateBreadCrumb(name, _id)

    //console.log(breadCrumb)
    res.json({
        code: 20000,
        data: {
            breadCrumb,
        },
    })
})

export default router
