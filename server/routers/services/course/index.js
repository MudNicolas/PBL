import Router from "express"

import User from "#models/User.js"
import Course from "#models/Course.js"
import view from "#services/course/view/index.js"

import courseManage from "./manage/index.js"

import { UploadImg } from "#services/tools/index.js"
import { InsertUsersReturnIDs } from "#services/tools/index.js"
import { COVER_PATH } from "#root/settings.js"

var router = Router()

router.use("/view", view)

var findCourseQuery = (uid, role) => {
    let query = {
        $and: [
            {
                isUsed: true,
            },
        ],
    }
    if (role === "student") {
        query.$and.push({
            studentList: uid,
        })
    }
    if (role === "teacher") {
        query.$and.push({
            $or: [
                {
                    chiefTeacher: uid,
                },
                {
                    partnerTeacher: uid,
                },
            ],
        })
    }
    return query
}

router.get("/getList", (req, res, next) => {
    const DEFAULT_LIMIT = 12
    const DEFAULT_PAGE = 1
    let limit = Number(req.query.limit) || DEFAULT_LIMIT
    let page = Number(req.query.page) || DEFAULT_PAGE

    Course.find(findCourseQuery(req.uid, req.role))
        .skip((page - 1) * limit)
        .limit(limit)
        .select("name partnerTeacher chiefTeacher introduction cover")
        .populate("chiefTeacher", "name")
        .populate("partnerTeacher", "name")
        .sort({
            _id: -1,
        })
        .then((courseList, err) => {
            //console.log(err, courseList)
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }

            courseList.forEach(course => {
                course.cover = `${COVER_PATH}/${course.cover}`
            })

            Course.countDocuments(findCourseQuery(req.uid)).then(courseNum => {
                res.json({
                    code: 20000,
                    data: {
                        courseList,
                        courseNum,
                    },
                })
            })
        })
})

router.get("/route", (req, res, next) => {
    Course.find(findCourseQuery(req.uid, req.role))
        .select("name")
        .sort({
            _id: -1,
        })
        .then((course, err) => {
            //console.log(course);
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }

            let courseRoute = []
            for (let e of course) {
                let singleRoute = {
                    path: `view/${e._id}`,
                    component: "view",
                    name: "CourseView",
                    meta: {
                        title: e.name,
                        roles: ["teacher", "student"],
                    },
                    children: [
                        {
                            path: "manage",
                            component: "manage",
                            name: "ManageCourse",
                            hidden: true,
                            meta: {
                                title: "管理",
                                roles: ["teacher"],
                            },
                        },
                    ],
                }
                courseRoute.push(singleRoute)
            }

            //console.log(courseRoute)
            res.json({
                code: 20000,
                data: {
                    courseRoute,
                },
            })
        })
})

/**以上为course公用权限api */
/**以下为教师权限api */

router.use((req, res, next) => {
    if (req.role != "teacher") {
        res.json({
            code: 60206,
            message: "你没有权限进行此操作",
        })
        return
    }
    next()
})

router.post("/search/teacher", (req, res, next) => {
    var name = req.body.name

    const reg = new RegExp(name, "i")
    //find 教师角色的，不是创建课程的教师，返回_id,username,name
    User.find(
        { name: { $regex: reg }, role: "teacher", _id: { $not: { $eq: req.uid } } },
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

router.post("/create/cover", (req, res, next) => {
    UploadImg("course", req)
        .then(coverFilename => {
            res.json({
                code: 20000,
                data: {
                    coverFilename: coverFilename,
                },
            })
            return
        })
        .catch(err => {
            console.log("uploadCover", err)
            res.json({
                code: 30001,
                message: "MultiParty Error!",
            })
            return
        })
})

router.post("/create", async (req, res, next) => {
    let course = req.body.course

    //console.log(course)
    let rowStudentList = course.studentList
    let { name, introduction, cover, partnerID } = course

    if (!name) {
        res.json({
            message: "必填项为空",
        })
        return
    }

    //格式化studentlist
    let studentList = rowStudentList.map(item => {
        return {
            username: item["学号"],
            name: item["姓名"],
        }
    })

    let userIDs = await InsertUsersReturnIDs(studentList, "student")
        .then(list => {
            return list
        })
        .catch(err => {
            console.log(err, "insert stuednt to User")
            return "err"
        })

    //返回list说明无err
    // console.log(userIDs, typeof (userIDs))
    if (typeof userIDs !== "object") {
        res.json({
            code: 30001,
            message: "DataBase Error",
        })
        return
    }

    let v_partner = await User.countDocuments({
        _id: { $in: partnerID },
        role: "teacher",
    })
        .exec()
        .catch(err => {
            return false
        })

    if (v_partner !== partnerID.length) {
        res.json({
            message: "存在非法ID",
        })
        return
    }

    let tempCourse = {
        name: name,
        cover: cover,
        studentList: userIDs,
        chiefTeacher: req.uid,
        partnerTeacher: partnerID,
        date: Date.now(),
    }
    if (introduction !== "") {
        tempCourse["introduction"] = introduction
    }
    var newCourse = new Course(tempCourse)
    newCourse.save((err, theCourse) => {
        //console.log(err, theCourse)
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
                courseID: theCourse._id,
            },
        })
        return
    })
})

router.use("/manage", courseManage)

export default router
