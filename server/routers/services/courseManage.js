import Router from 'express'
let router = Router()
import Course from "#models/Course.js"

router.all('*', (req, res, next) => {
	let courseID = req.body.courseID
	let validate = /^[a-fA-F0-9]{24}$/.test(courseID);
	if (!validate) {
		res.json({
			code: 404,
			message: "error"
		})
		return
	}
	Course.findById(courseID)
		.select('isUsed chiefTeacher partnerTeacher')
		.then((course, err) => {
			if (err) {
				res.json({
					code: 30001,
					message: "DataBase Error"
				})
				return
			}

			if (!course || course.isUsed === false) {
				res.json({
					code: 404,
					message: "该课程不存在"
				})
				return
			}

			/*  既不是chief，也不是partner里的
				 p._id是object，要toString
			 */
			if (course.chiefTeacher._id.toString() !== req.uid &&
				!course.partnerTeacher.some(p => { return p._id.toString() === req.uid })) {
				res.json({
					code: 401,
					message: "401 Not Permission"
				})
				return
			}

			next()
		})
})

import info from "./modules/CourseManage/info.js"
import student from "./modules/CourseManage/student.js"
import partner from "./modules/CourseManage/partner.js"
import template from "./modules/CourseManage/commentTemplate.js"
router.use('/info', info)
router.use('/student', student)
router.use('/partner', partner)
router.use('/commentTemplate', template)











export default router
