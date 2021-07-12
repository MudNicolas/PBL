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
					delete e.isUsed
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

/**
 *
 * @param {array} group
 * @param {student _id} sid
 *
 */
function studentInGroup(group, sid) {
	return group.some(g => {
		return g.groupMember.some(m => {
			return m.toString() === sid.toString()
		})
	})
}

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
				if (!studentInGroup(group, s._id)) {
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

router.post('/create', (req, res) => {
	let { courseID, newGroup } = req.body

	Course
		.findById(courseID)
		.select('group studentList')
		.then((course, err) => {
			if (err) {
				res.json({
					code: 30001,
					message: 'DataBase Error'
				})
				return;
			}
			let { studentList } = course
			let { groupMembersID } = newGroup
			let isNotInTheCourse = groupMembersID.some(m => {
				return studentList.indexOf(m) === -1
			})

			if (isNotInTheCourse) {
				res.json({
					code: 31003,
					message: "目标组中有学生不属于本课程"
				})
				return
			}
			let { group } = course
			//如果groupMemberID有已经成组的
			let hasGrouped = groupMembersID.some(m_id => {
				if (studentInGroup(group, m_id)) {
					return true
				}
			})
			if (hasGrouped) {
				res.json({
					code: 31002,
					message: "目标组中已有学生成组"
				})
				return
			}

			let groupName = newGroup.name || ""
			let groupSchema = {
				name: groupName,
				groupMember: groupMembersID
			}
			course.group.push(groupSchema)
			course.save().then((newG, err) => {
				if (err) {
					res.json({
						code: 30001,
						message: 'DataBase Error'
					})
					return;
				}
				res.json({
					code: 20000
				})
			})

		})

})

export default router
