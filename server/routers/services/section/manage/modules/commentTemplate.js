import Router from "express"

let router = Router()

router.get("/get", (req, res) => {
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

router.post("/new", (req, res) => {
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
