import Router from 'express'
var router = Router()
import Course from '../../models/Course.js'



async function generateBreadCrumb(name, id) {

	const routeTree = {
		'Home': {
			path: '/',
			redirect: '/',
			parent: 'Null',
			meta: { title: "首页" },
		},
		'Course': {
			path: '/course',
			parent: 'Home',
			redirect: 'noRedirect',
			meta: { title: '我的课程' },
		},
		'CourseView': {
			path: "/course/view/",
			parent: 'Course',
			meta: {
				title: async id => {
					if (/^[a-fA-F0-9]{24}$/.test(id)) {
						let title = await Course.findById(id).select('name').then(e => {
							//console.log(e)
							return e
						})
						return title
					}
				}
			},
		},
		'ManageCourse': {
			path: '/course/manage',
			parent: 'CourseView',
			meta: { title: '管理' }
		},
		'Profile': {
			path: '/profile',

			parent: "Home",
			meta: {
				title: '个人信息'
			}

		}
	}

	let p = name
	let gen = []
	while (p != 'Null') {
		if (routeTree[p]) {
			let item = routeTree[p]
			gen.push(item)
			p = item.parent
		} else {
			p = "Home"
		}
	}
	let fid = id
	//console.log(fid)
	for (let f of gen) {
		if (f.meta && f.meta.title && typeof (f.meta.title) === 'function') {
			f.path += fid
			let func = f.meta.title
			let funcTitle = await func(fid)

			f.meta.title = funcTitle.name
			if (funcTitle.parentID) {
				fid = funcTitle.parentID
			}
		}
	}
	gen.reverse()
	return gen
}


router.post('/get', async (req, res, next) => {
	let params = req.body.params
	let name = req.body.name
	//console.log(params)
	let breadCrumb = []

	breadCrumb = await generateBreadCrumb(name, params.id)

	//console.log(breadCrumb)
	res.json({
		code: 20000,
		data: {
			breadCrumb: breadCrumb
		}
	})

})

export default router
