import Router from 'express'
let router = Router()
import Course from "#models/Course.js"


router.post('/get', (req, res) => {
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

		let t = commentTemplate.filter(e => {
			if (e.isUsed) {
				e.template.forEach(i => {
					delete i._id
				})
				delete e.isUsed
				return e
			}
		});

		res.json({
			code: 20000,
			data: {
				commentTemplate: t
			}
		})
	})
})

router.post('/create', (req, res) => {
	let { courseID, template } = req.body
	let temp = template.entry
	let uniqueTemp = new Set(temp)
	if (uniqueTemp.size !== temp.length) {
		res.json({
			code: 31001,
			message: "存在重复条目"
		})
		return
	}
	Course.findById(courseID).select('commentTemplate').then((course, err) => {
		if (err) {
			res.json({
				code: 30001,
				message: 'DataBase Error'
			})
			return;
		}


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

router.all("*", (req, res, next) => {
	let { courseID } = req.body
	let templateID = req.body.templateID || req.body.template._id
	Course.findOne({
		_id: courseID,
	}, {
		commentTemplate: {
			$elemMatch: { _id: templateID }
		}
	}).then((course, err) => {
		if (err) {
			res.json({
				code: 30001,
				message: 'DataBase Error'
			})
			return;
		}
		if (!course || !course.commentTemplate[0]) {
			res.json({
				code: 30404,
				message: '该条目不存在'
			})
			return
		}
		next()
	})
})

router.post('/edit', (req, res) => {
	let { courseID, template } = req.body
	let temp = template.entry
	let uniqueTemp = new Set(temp)
	if (uniqueTemp.size !== temp.length) {
		res.json({
			code: 31001,
			message: "存在重复条目"
		})
		return
	}
	Course.findOne({
		_id: courseID,
	}, {
		commentTemplate: {
			$elemMatch: { _id: template._id }
		}
	}).then((course) => {

		course.commentTemplate[0].template = temp
		course.commentTemplate[0].name = template.name
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

router.post('/delete', (req, res) => {
	let { courseID, templateID } = req.body
	Course.findOne({
		_id: courseID,
	}, {
		commentTemplate: {
			$elemMatch: { _id: templateID }
		}
	}).then((course) => {
		course.commentTemplate[0].isUsed = false;
		course.save().then(() => {
			res.json({
				code: 20000
			})
		})
	})
})

export default router
