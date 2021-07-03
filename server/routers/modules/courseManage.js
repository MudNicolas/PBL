import Router from 'express'
var router = Router()
import Course from '../../models/Course.js'
import { COVER_PATH } from "../../settings.js"
import { InsertUsersReturnIDs } from './tools.js'
import User from "../../models/User.js"

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

router.post('/getAllTeacher', (req, res) => {
	let courseID = req.body.courseID
	Course
		.findById(courseID)
		.select('chiefTeacher partnerTeacher')
		.populate([{ path: 'chiefTeacher', select: 'name avatar introduction' }, { path: 'partnerTeacher', select: 'name avatar introduction' }])
		.then((t, err) => {
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
					teahcer: t
				}
			})
		})
})

//搜索时不显示已有的教师
router.post('/search/teacher', async (req, res, next) => {
	var name = req.body.name;
	let courseID = req.body.courseID

	let currentTeacher =
		await Course
			.findById(courseID)
			.select('chiefTeacher partnerTeacher')
			.then((ct, err) => {
				if (err) {
					res.json({
						code: 30001,
						message: "DataBase Error"
					})
					return
				}
				return [ct.chiefTeacher, ...ct.partnerTeacher]
			})

	const reg = new RegExp(name, 'i')
	//find 教师角色的，不是创建课程的教师，返回_id,username,name
	User.find({ name: { $regex: reg }, role: 'teacher', _id: { $nin: currentTeacher } }, ['_id', 'username', 'name'], (err, result) => {
		if (err) {
			console.log(err);
			res.json({
				code: 30001,
				message: 'DataBase Error'
			})
			return;
		}
		res.json({
			code: 20000,
			data: result
		})
	})
})

router.post('/addPartnerTeacher', (req, res) => {
	let { courseID, t_uids } = req.body
	Course.findById(courseID).select('partnerTeacher').then((c, err) => {
		if (err) {
			res.json({
				code: 30001,
				message: 'DataBase Error'
			})
			return;
		}
		c.partnerTeacher = [...c.partnerTeacher, ...t_uids]
		c.save().then(() => {
			res.json({
				code: 20000,
			})
		})
	})
})



router.post('/getAllCommentTemplate', (req, res) => {
	let courseID = req.body.courseID
	Course.findById(courseID).select('commentTemplate').then((course, err) => {
		if (err) {
			res.json({
				code: 30001,
				message: 'DataBase Error'
			})
			return;
		}
		let { commentTemplate } = course.toJSON()

		commentTemplate.forEach(e => {
			e.template.forEach(i => {
				delete i._id
			})
		});

		res.json({
			code: 20000,
			data: {
				commentTemplate: commentTemplate
			}
		})
	})
})

router.post('/newCommentTemplate', (req, res) => {
	let { courseID, template } = req.body
	//console.log(template)
	Course.findById(courseID).select('commentTemplate').then((course, err) => {
		if (err) {
			res.json({
				code: 30001,
				message: 'DataBase Error'
			})
			return;
		}

		let temp = template.entry.map(e => {
			return { entry: e }
		})
		course.commentTemplate.push({
			name: template.name,
			template: temp
		})
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
