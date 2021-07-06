import Router from 'express'
let router = Router()
import Course from "#models/Course.js"
import { COVER_PATH } from "#root/settings.js"

router.post('/get', (req, res, next) => {
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

router.post('/edit', (req, res, next) => {
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

export default router
