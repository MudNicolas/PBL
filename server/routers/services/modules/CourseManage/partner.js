import Router from "express"
var router = Router()

import User from "#models/User.js"

router.get("/getAllTeacher", (req, res) => {
    let { course } = req
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
    let { course } = req
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

router.use((req, res, next) => {
    let { course } = req
    if (course.chiefTeacher.toString() !== req.uid.toString()) {
        res.json({
            code: 401,
        })
        return
    }
    next()
})

router.use(async (req, res, next) => {
    let { t_uids } = req.body

    let v = await User.countDocuments({
        _id: { $in: t_uids },
        role: "teacher",
    })
        .exec()
        .catch(err => {
            return false
        })

    if (v !== t_uids.length) {
        res.json({
            message: "存在非法ID",
        })
        return
    }
    next()
})

router.post("/addTeacher", (req, res) => {
    let { course } = req
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
