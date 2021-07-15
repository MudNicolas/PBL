import Router from "express"
import Course from "#models/Course.js"
import { COVER_PATH } from "#root/settings.js"

import Mock from "mockjs"

var router = Router()

router.all("*", (req, res, next) => {
    let courseID = req.body.courseID || req.query.courseID
    let validate = /^[a-fA-F0-9]{24}$/.test(courseID)
    if (!validate) {
        res.json({
            code: 404,
            message: "error",
        })
        return
    }
    Course.findById(courseID)
        .select("isUsed chiefTeacher partnerTeacher studentList")
        .then((course, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }

            if (!course || course.isUsed === false) {
                res.json({
                    code: 404,
                    message: "该课程不存在",
                })
                return
            }

            /*  既不是chief，也不是partner里的，也不是studentlist里的
				 p._id是object，要toString
			 */
            if (
                course.chiefTeacher._id.toString() !== req.uid &&
                !course.partnerTeacher.some(p => {
                    return p._id.toString() === req.uid
                }) &&
                !course.studentList.some(p => {
                    return p._id.toString() === req.uid
                })
            ) {
                res.json({
                    code: 401,
                    message: "401 Not Permission",
                })
                return
            }

            next()
        })
})

router.get("/get", (req, res, next) => {
    let courseID = req.query.courseID
    Course.findById(courseID)
        .select("name introduction chiefTeacher partnerTeacher cover")
        .populate("chiefTeacher", "name")
        .populate("partnerTeacher", "name")
        .then((course, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }

            course.cover = `${COVER_PATH}/${course.cover}`

            let sections = []
            for (let i = 0; i < 10; i++) {
                sections.push(
                    Mock.mock({
                        name: "@ctitle",
                        info: "@cparagraph",
                        visible: "@boolean",
                        _id: "@title",
                    })
                )
            }

            res.json({
                code: 20000,
                data: {
                    course: course,
                    sections: sections,
                },
            })
        })
    /*  let course = Mock.mock({
		 name: '@ctitle',
		 introduction: "@cparagraph",
		 chiefTeacher: {
			 name: "@cname"
		 },
		 partnerTeacher: [{
			 name: "@cname"
		 }, {
			 name: "@cname"
		 }, {
			 name: "@cname"
		 }, {
			 name: "@cname"
		 }],
		 cover: "@image('500x300')"
	 })
	 res.json({
		 code: 20000,
		 data: {
			 course: course
		 }
	 }) */
})

export default router
