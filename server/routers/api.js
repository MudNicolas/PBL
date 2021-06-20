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
			var loginHistory = new LoginHistory({
				uid: validateUser._id,
				loginTime: new Date(),
				role: role
			});
			loginHistory.save().then(() => {
				var token = AESEncode(loginHistory)
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

router.all('/logout', (req, res, next) => {
	res.json({
		code: 20000,
		data: 'success'
	})
})


router.all('*', async (req, res, next) => {
	var token = req.headers.token;
	if (!token) {
		res.json({
			code: 50008
		})
		return;
	}
	var { uid, loginTime, role } = AESDecode(token);
	var loginCheck = await LoginHistory.findOne({
		uid: uid,
		loginTime: loginTime,
		role: role
	}).then((theLogin) => {
		return theLogin;
	})

	if (!loginCheck) {
		res.json({
			code: 50008,
			message: 'Login failed, unable to get user details.'
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
		req.uid = uid;
		req.role = role;
		next()
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
