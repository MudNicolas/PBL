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
			res.json({
				code: 20000,
				data: {
					group: group,
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
	let { courseID, targetGroup } = req.body
	if (targetGroup.groupMembersID.length === 0) {
		res.json({
			code: 31004,
			message: '组员不能为空'
		})
		return
	}

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
			let { groupMembersID } = targetGroup
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

			let groupName = targetGroup.name || ""
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

router.all('*', (req, res, next) => {
	let courseID = req.query.courseID || req.body.courseID
	let groupID = req.query.groupID || req.body.targetGroup._id

	Course.findById(courseID, {
		group: {
			$elemMatch: { _id: groupID }
		}
	}).then((course, err) => {
		if (err) {
			res.json({
				code: 30001,
				message: 'DataBase Error'
			})
			return;
		}
		if (!course || !course.group[0]) {
			res.json({
				code: 31005,
				message: '该组不存在'
			})
			return
		}
		next()
	})
})

router.get('/editData/get', (req, res) => {
	let { courseID, groupID } = req.query
	Course
		.findById(courseID)
		.select('studentList group')
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

			let editSourceData = course.studentList.filter(s => {
				if (!studentInGroup(course.group, s._id)) {
					return s
				}
			})

			let groupMembersID, groupName
			for (let g of course.group) {
				if (g._id.toString() === groupID.toString()) {
					groupMembersID = g.groupMember
					groupName = g.name
					break
				}
			}

			let groupData = course.studentList.filter(s => groupMembersID.indexOf(s._id) > -1)
			editSourceData = [...editSourceData, ...groupData]

			res.json({
				code: 20000,
				data: {
					editSourceData: editSourceData,
					groupMembersID: groupMembersID,
					groupName: groupName
				}
			})


		})
})

router.post('/edit', (req, res) => {
	let { courseID, targetGroup } = req.body
	let groupID = targetGroup._id
	Course
		.findById(courseID)
		.select('studentList group')
		.then((course, err) => {
			if (err) {
				res.json({
					code: 30001,
					message: 'DataBase Error'
				})
				return;
			}
			let { studentList } = course
			let { groupMembersID } = targetGroup
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
			let otherGroup = group.filter(g => g._id.toString() !== groupID)
			//如果groupMemberID有在其他组已经成组的
			let hasGrouped = groupMembersID.some(m_id => {
				if (studentInGroup(otherGroup, m_id)) {
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

			for (let g of course.group) {
				if (g._id.toString() === groupID) {
					g.name = targetGroup.name;
					g.groupMember = targetGroup.groupMembersID
					break
				}
			}
			course.save().then((c, err) => {
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
