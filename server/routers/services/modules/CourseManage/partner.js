import Router from "express"
var router = Router()
import Course from "#models/Course.js"

import User from "#models/User.js"

let course
router.use((req, res, next) => {
    course = req.course
    next()
})

router.get("/getAllTeacher", (req, res) => {
    course
        .execPopulate([
            { path: "chiefTeacher", select: "name avatar" },
            { path: "partnerTeacher", select: "name avatar" },
        ])
        .then((t, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }
            let data = {
                chiefTeacher: t.chiefTeacher,
                partnerTeacher: t.partnerTeacher,
            }
            res.json({
                code: 20000,
                data: {
                    teahcer: data,
                },
            })
        })
})

//搜索时不显示已有的教师
router.post("/search/teacher", async (req, res, next) => {
    var name = req.body.name

    let currentTeacher = [course.chiefTeacher, ...course.partnerTeacher]

    const reg = new RegExp(name, "i")
    //find 教师角色的，不是创建课程的教师，返回_id,username,name
    User.find(
        { name: { $regex: reg }, role: "teacher", _id: { $nin: currentTeacher } },
        ["_id", "username", "name"],
        (err, result) => {
            if (err) {
                console.log(err)
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }
            res.json({
                code: 20000,
                data: result,
            })
        }
    )
})

router.post("/addTeacher", (req, res) => {
    let { t_uids } = req.body

    course.partnerTeacher = [...course.partnerTeacher, ...t_uids]
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
