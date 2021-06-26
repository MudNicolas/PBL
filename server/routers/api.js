import Router from 'express'
import User from '../models/User.js'
import LoginHistory from '../models/LoginHistory.js'
import { AESEncode, AESDecode } from './modules/tools.js'

var router = Router()

router.all('/login', (req, res, next) => {
	var username = req.body.username;
	var password = req.body.password;
	var role = req.body.role;
	User.findOne({
		username: username,
		password: password,
		isUsed: true
	}).then((validateUser) => {
		if (validateUser) {
			//console.log(validateUser.role, role)
			if (!validateUser.role.includes(role)) {
				res.json({
					code: 60205,
					message: '该用户无此角色'
				})
				return;
			}
			let loginHistory = new LoginHistory({
				uid: validateUser._id,
				loginTime: new Date(),
				latestOperationTime: new Date(),
				role: role
			});
			loginHistory.save().then((t) => {

				var token = AESEncode({
					uid: t.uid,
					loginTime: t.loginTime,
					role: t.role
				})
				//返回token
				res.json({
					code: 20000,
					data: { token: token },

				})
				return;
			});
			return;
		} else {
			res.json({
				code: 60204,
				message: '用户名或密码错误'
			})
			return;
		}
	});


})



router.all('*', async (req, res, next) => {
	let token = req.headers.token;
	if (!token) {
		res.json({
			code: 50008
		})
		return;
	}
	let { uid, loginTime, role } = AESDecode(token);
	let loginCheck = await LoginHistory.findOne({
		uid: uid,
		loginTime: loginTime,
		role: role,
		logout: false
	}).then((theLogin) => {
		return theLogin;
	})


	if (!loginCheck) {
		res.json({
			code: 50008,
			message: 'token失效，请重新登录'
		})
		return;
	}


	//2小时session time
	if (Date.now() - loginCheck.latestOperationTime > 1000 * 60 * 60 * 2) {
		res.json({
			code: 50014,
			message: '您长时间未活动，请重新登陆'
		})
		return;
	}

	User.findById(uid).select('isUsed').then(v_user => {
		if (v_user.isUsed === false || !v_user) {
			res.json({
				code: 60205,
				message: '该用户不存在'
			})
			return;
		}
		loginCheck.latestOperationTime = new Date()
		loginCheck.save().then((e) => {

			req.uid = uid;
			req.role = role;
			next()
		})

	})
})

router.all('/logout', (req, res, next) => {
	let token = req.headers.token;
	var { uid, loginTime, role } = AESDecode(token);
	LoginHistory.findOne({
		uid: uid,
		loginTime: loginTime,
		role: role,
		logout: false
	}).then((theLogin) => {
		theLogin.logout = true
		theLogin.save().then(() => {
			res.json({
				code: 20000,
				data: 'success'
			})
		})
	})
})


import user from './modules/user.js'
import theme from './modules/theme.js'
import course from './modules/course.js'
import view from './modules/view.js'
import breadCrumb from './modules/breadCrumb.js'

router.use('/user', user)
router.use('/theme', theme)
router.use('/course', course)
router.use('/view', view)
router.use('/breadCrumb', breadCrumb)


export default router;
