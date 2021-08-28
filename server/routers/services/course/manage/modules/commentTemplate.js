import Router from "express"

let router = Router()

router.get("/get", (req, res) => {
    let { course } = req
    let { commentTemplate } = course.toJSON()

    let t = commentTemplate.filter(e => {
        if (e.isUsed) {
            e.template.forEach(i => {
                delete i._id
            })
            delete e.isUsed
            return e
        }
    })

    res.json({
        code: 20000,
        data: {
            commentTemplate: t,
        },
    })
})

router.post("/create", (req, res) => {
    let { course } = req
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

router.all("*", (req, res, next) => {
    let { course } = req
    let templateID = req.body.templateID || req.body.template._id
    let validate = /^[a-fA-F0-9]{24}$/.test(templateID)
    if (!validate) {
        res.json({
            code: 404,
            message: "error",
        })
        return
    }
    validate = course.commentTemplate.some(c => c._id.toString() === templateID && c.isUsed)
    if (!validate) {
        res.json({
            code: 30404,
            message: "该条目不存在",
        })
        return
    }
    next()
})

router.post("/edit", (req, res) => {
    let { course } = req
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

    for (let i of course.commentTemplate) {
        if (i._id.toString() === template._id) {
            i.template = temp
            i.name = template.name
            break
        }
    }

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

router.delete("/delete", (req, res) => {
    let { course } = req
    let { templateID } = req.body
    for (let i of course.commentTemplate) {
        if (i._id.toString() === templateID) {
            i.isUsed = false
            break
        }
    }

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
