import Router from "express"
let router = Router()
import Mock from "mockjs"

let section

router.use((req, res, next) => {
    section = req.section
    next()
})

router.get("/info/get", (req, res) => {
    let data = {
        _id: section._id,
        name: section.name,
        info: section.info,
        visible: section.visible,
    }
    res.json({
        code: 20000,
        data: data,
    })
})

router.post("/info/set", (req, res) => {
    let sectionKey = Object.keys(req.body.section)

    for (let k of sectionKey) {
        section[k] = req.body.section[k]
    }

    section.save(err => {
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

router.post("/delete", (req, res) => {
    section.isUsed = false
    section.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }
        res.json({
            code: 20000,
            toPath: `/course/view/${section.courseID}`,
        })
    })
})

router.get("/content/get", (req, res) => {
    let content = []
    for (let i = 0; i < 3; i++) {
        content.push(
            Mock.mock({
                url: "http://www.baidu.com",
                name: "@ctitle",
                type: "url",
            })
        )
    }
    for (let i = 0; i < 3; i++) {
        content.push(
            Mock.mock({
                _id: "@id",
                name: "文件.pptx",
                type: "file",
            })
        )
    }
    for (let i = 0; i < 3; i++) {
        content.push(
            Mock.mock({
                _id: "@id",
                name: "@ctitle",
                type: "assignment",
            })
        )
    }

    res.json({
        code: 20000,
        data: content,
    })
})

export default router
