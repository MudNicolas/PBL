import Router from "express"
var router = Router()
import Course from "#models/Course.js"
import { InsertUsersReturnIDs } from "#services/tools.js"

let course
router.use((req, res, next) => {
    course = req.course
    next()
})

router.get("/get", (req, res) => {
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
    let studentList = req.body.studentList

    studentList = studentList.map(item => {
        return {
            username: item["学号"],
            name: item["姓名"],
        }
    })

    let studentIDs = await InsertUsersReturnIDs(studentList, "student")
        .then(list => {
            return list
        })
        .catch(err => {
            console.log(err, "insert stuednt to User")
            return "err"
        })

    //返回list说明无err
    //console.log(studentIDs, typeof (studentIDs))
    if (typeof studentIDs !== "object") {
        res.json({
            code: 30001,
            message: "DataBase Error",
        })
        return
    }

    for (let e of studentIDs) {
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

export default router
