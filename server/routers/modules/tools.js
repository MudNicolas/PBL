import crypto from 'crypto';
import md5 from 'js-md5';
import multiparty from 'multiparty';
import User from '../../models/User.js'
import { DEFAULT_PASSWORD } from "../../settings.js"



var secretkey = "NicolasAirline";
//aes加密解密
export function AESEncode(e) {
	//加密uid+logintime防止token盗用
	var content = JSON.stringify(e);
	var cipher = crypto.createCipher('aes192', secretkey); //使用aes128加密
	var enc = cipher.update(content, "utf8", "hex"); //编码方式从utf-8转为hex;
	enc += cipher.final('hex'); //编码方式转为hex;
	return enc;
}

export function AESDecode(e) {
	//防止用户乱搞
	try {
		var enc = e;
		var decipher = crypto.createDecipher('aes192', secretkey);
		var dec = decipher.update(enc, "hex", "utf8");
		dec += decipher.final("utf8");
		return JSON.parse(dec);
	} catch (error) {
		return 0
	}

};



//统一图片上传中心
export function UploadImg(path, req) {



	var form = new multiparty.Form({
		uploadDir: 'public/img/' + path
	});
	return new Promise((resolve, reject) => {
		form.parse(req, function (err, field, files) {
			if (err) {
				reject(err);
				return
			}
			const imgPath = files.img[0].path;
			var imgFilename = imgPath.split('\\')[imgPath.split('\\').length - 1]
			resolve(imgFilename)
			return
		});
	})
}


/**
 * @list 人员列表，包含学号工号、姓名
 * @role 插入的人的角色 student teacher
 */
export function InsertUsersReturnIDs(list, role) {
	let IDs = [];

	let findOutOrInsert = e => {
		return new Promise((resolve, reject) => {
			User.findOne({
				$and: [
					{ username: e.username },
					{ isUsed: true }
				]
			}).then(user => {
				if (user) {
					resolve(user._id)
					return
				}

				//未找到则插入
				let newUser = new User({
					username: e.username,
					password: md5(DEFAULT_PASSWORD.toString()),
					name: e.name,
					role: [role],
				})
				newUser.save().then((theUser, err) => {
					if (err) {
						reject(err)
						return
					}
					resolve(theUser._id)
					return
				})
			})
		})
	}

	for (let e of list) {
		IDs.push(findOutOrInsert(e))
	}

	return Promise.all(IDs)
		.then((e) => {
			//console.log(e)
			return e
		})
		.catch(err => {
			return err
		})

}
