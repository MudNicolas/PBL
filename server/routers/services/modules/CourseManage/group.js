import Course from '#models/Course.js'
import Router from 'express'
let router = Router()

router.get('/get', (req, res) => {
	let courseID = req.query.courseID
	Course
		.findById(courseID)
		.select('group studentList')
		.populate({ path: 'group.groupMember', select: 'name username' })
		.then((course, err) => {
			if (err) {
				res.json({
					code: 30001,
					message: 'DataBase Error'
				})
				return;
			}
			let { group, studentList } = course.toJSON()
			let g = group.filter(e => {
				if (e.isUsed) {
					return e
				}
			})

			res.json({
				code: 20000,
				data: {
					group: g,
					studentNumber: studentList.length
				}
			})
		})
})

router.get('/unGroupedStudents/get', (req, res, next) => {
	let courseID = req.query.courseID
	Course
		.findById(courseID)
		.select('group studentList')
		.populate({
			path: 'studentList', select: 'name username', options: {
				sort: {
					'username': 1
				}
			}
		})
		.then((course, err) => {
			if (err) {
				res.json({
					code: 30001,
					message: 'DataBase Error'
				})
				return;
			}
			let { studentList, group } = course
			//filter some 确定不在所有组内的学生
			let unGroupedStudents = studentList.filter(s => {
				if (!group.some(g => {
					return g.groupMember.some(m => {
						return m === s._id
					})
				})) {
					return s
				}
			})

			res.json({
				code: 20000,
				data: {
					unGroupedStudents: unGroupedStudents
				}
			})


		})
})

export default router
