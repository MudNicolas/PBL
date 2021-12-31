import Router from "express"

let router = Router()

router.get("/get", (req, res) => {
    let { course } = req
    let { interEvaluationTemplate } = course.toJSON()
    let t = interEvaluationTemplate.filter(e => {
        if (e.isUsed) {
            delete e.isUsed
            return e
        }
    })

    res.json({
        code: 20000,
        data: {
            interEvaluationTemplate: t,
        },
    })
})

router.post("/create", (req, res) => {
    let { course } = req
    let { template } = req.body
    let { newTemplateName, dimensionList } = template

    if (!newTemplateName.trim()) {
        res.json({
            message: "请输入模板名称",
        })
        return false
    }

    for (let dimension of dimensionList) {
        if (!checkDimension(dimension)) {
            res.json({
                message: "文件错误，请遵循模板格式填入信息！",
            })
            return false
        }
    }

    course.interEvaluationTemplate.push({
        name: newTemplateName,
        dimensions: dimensionList.map(e => ({
            dimensionName: e["维度"],
            starText: formatDimensionStarText(e),
        })),
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

function checkDimension(d) {
    d["维度"] = (d["维度"] || "").toString().trim()
    if (!d["维度"]) return false

    for (let i = 1; i <= 5; i++) {
        d[`${i}星文本`] = (d[`${i}星文本`] || "").toString().trim()
        if (!d[`${i}星文本`]) return false
    }
    return true
}

function formatDimensionStarText(d) {
    let data = []
    for (let i = 1; i <= 5; i++) {
        data.push((d[`${i}星文本`] || "").toString().trim())
    }
    return data
}

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
    validate = course.interEvaluationTemplate.some(c => c._id.toString() === templateID && c.isUsed)
    if (!validate) {
        res.json({
            code: 30404,
            message: "该条目不存在",
        })
        return
    }
    next()
})

router.delete("/delete", (req, res) => {
    let { course } = req
    let { templateID } = req.body
    for (let i of course.interEvaluationTemplate) {
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
