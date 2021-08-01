import Router from "express"
let router = Router()
import { COVER_PATH } from "#root/settings.js"

let course
router.use((req, res, next) => {
    course = req.course
    next()
})

router.get("/get", (req, res, next) => {
    let courseInfo = {
        name: course.name,
        introduction: course.introduction,
        cover: course.cover,
    }

    res.json({
        code: 20000,
        data: {
            courseInfo: courseInfo,
            coverUrl: `${COVER_PATH}/${course.cover}`,
        },
    })
})

router.post("/edit", (req, res, next) => {
    let { introduction, cover } = req.body.course
    course.introduction = introduction
    course.cover = cover
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
            message: "课程信息更新成功",
        })
    })
})

export default router
