import Router from 'express'
var router = Router()
import Course from "#models/Course.js"
import { InsertUsersReturnIDs } from '#services/tools.js'

router.post('/get', (req, res, next) => {
	let courseID = req.body.courseID;
	Course
		.findById(courseID)
		.select('studentList name')
		.populate({
			path: 'studentList',
			select: 'name username',
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


			res.json({
				code: 20000,
				data: {
					studentList: list.studentList,
					courseName: list.name
				}
			})

		})
})

router.post('/submit', async (req, res, next) => {
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
