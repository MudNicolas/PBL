import Router from 'express'
var router = Router()
import Course from "#models/Course.js"


import User from "#models/User.js"


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

router.post('/addTeacher', (req, res) => {
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


export default router
