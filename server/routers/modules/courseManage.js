import Router from 'express'
var router = Router()
import Course from '../../models/Course.js'
import { COVER_PATH } from "../../settings.js"
import { InsertUsersReturnIDs } from './tools.js'

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

router.post('/getInfo', (req, res, next) => {
	let courseID = req.body.courseID;
	Course
		.findById(courseID)
		.select('name introduction cover')
		.then((course, err) => {
			if (err) {
				res.json({
					code: 30001,
					message: "DataBase Error"
				})
				return
			}

			res.json({
				code: 20000,
				data: {
					courseInfo: course,
					coverUrl: `${COVER_PATH}/${course.cover}`
				}
			})
		})
})

router.post('/editInfo', (req, res, next) => {
	let { _id, introduction, cover } = req.body.course
	//console.log(_id, introduction)
	Course
		.findById(_id)
		.select('name introduction cover')
		.then((course, err) => {
			if (err) {
				res.json({
					code: 30001,
					message: "DataBase Error"
				})
				return
			}

			course.introduction = introduction
			course.cover = cover
			course.save().then((u, err) => {
				if (err) {
					res.json({
						code: 30001,
						message: "DataBase Error"
					})
					return
				}
				res.json({
					code: 20000,
					message: '课程信息更新成功'
				})
			})


		})
})

router.post('/getStudentList', (req, res, next) => {
	let courseID = req.body.courseID;
	Course
		.findById(courseID)
		.select('studentList name')
		.populate({
			path: 'studentList',
			options: {
				sort: {
					'username': 1
				}
			}
		})

		.then((list, err) => {
			if (err) {
				res.json({
					code: 30001,
					message: "DataBase Error"
				})
				return
			}
			let sList = list.studentList.map(e => { return { name: e.name, username: e.username, _id: e._id } })
			//console.log(sList)

			res.json({
				code: 20000,
				data: {
					studentList: sList,
					courseName: list.name
				}
			})

		})
})

router.post('/submitStudentList', async (req, res, next) => {
	let studentList = req.body.studentList
	let courseID = req.body.courseID

	studentList = studentList.map(item => {
		return {
			username: item['学号'],
			name: item['姓名']
		}
	})


	let studentIDs = await InsertUsersReturnIDs(studentList, 'student')
		.then(list => {
			return list
		})
		.catch((err) => {
			console.log(err, 'insert stuednt to User')
			return ('err')
		})

	//返回list说明无err
	//console.log(studentIDs, typeof (studentIDs))
	if (typeof (studentIDs) !== 'object') {
		res.json({
			code: 30001,
			message: "DataBase Error"
		})
		return
	}


	Course.findById(courseID).select('studentList').then((list, err) => {
		if (err) {
			res.json({
				code: 30001,
				message: "DataBase Error"
			})
			return
		}

		for (let e of studentIDs) {
			if (list.studentList.indexOf(e) === -1) {
				list.studentList.push(e)
			}
		}
		//console.log(list, 'before')
		list.save().then((afterList, err) => {
			if (err) {
				res.json({
					code: 30001,
					message: "DataBase Error"
				})
				return
			}


			res.json({
				code: 20000,

			})
		})

	})
})

export default router
