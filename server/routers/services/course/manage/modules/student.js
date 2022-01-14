import Router from "express"

import { InsertUsersReturnIDs } from "#services/tools/index.js"

var router = Router()

router.get("/get", (req, res) => {
    let { course } = req
    course
        .execPopulate({
            path: "studentList",
            select: "name username",
            options: {
                sort: {
                    username: 1,
                },
            },
        })
        .then((list, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }

            res.json({
                code: 20000,
                data: {
                    studentList: list.studentList,
                    courseName: list.name,
                },
            })
        })
})

router.post("/submit", async (req, res, next) => {
    let { course } = req
    let studentList = req.body.studentList

    if (studentList.length === 0) {
        res.json({
            message: "学生列表不能为空",
        })
        return
    }

    studentList = studentList.map(item => {
        return {
            username: item["学号"],
            name: item["姓名"],
        }
    })

    InsertUsersReturnIDs(studentList, "student")
        .then(list => {
            for (let e of list) {
                if (course.studentList.indexOf(e) === -1) {
                    course.studentList.push(e)
                }
            }
            //console.log(list, 'before')
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
        .catch(err => {
            console.log(err, "insert stuednt to User")
            res.json({
                message: "导入失败：" + err,
            })
            return
        })
})

export default router
