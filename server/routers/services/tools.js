import crypto from "crypto"
import md5 from "js-md5"
import multiparty from "multiparty"
import User from "#models/User.js"
import Course from "#models/Course.js"
import { DEFAULT_PASSWORD, SECRET_KEY, IV } from "#root/settings.js"

const algorithm = "aes128"
//aes加密解密
export function AESEncode(e) {
    //加密uid+logintime防止token盗用
    var content = JSON.stringify(e)
    var cipher = crypto.createCipheriv(algorithm, SECRET_KEY, IV) //使用aes192加密
    var enc = cipher.update(content, "utf8", "hex") //编码方式从utf-8转为hex;
    enc += cipher.final("hex") //编码方式转为hex;
    return enc
}

export function AESDecode(e) {
    //防止用户乱搞
    try {
        var enc = e
        var decipher = crypto.createDecipheriv(algorithm, SECRET_KEY, IV)
        var dec = decipher.update(enc, "hex", "utf8")
        dec += decipher.final("utf8")
        return JSON.parse(dec)
    } catch (error) {
        return 0
    }
}

//统一图片上传中心
export function UploadImg(path, req) {
    var form = new multiparty.Form({
        uploadDir: "public/img/" + path,
    })
    return new Promise((resolve, reject) => {
        form.parse(req, function (err, field, files) {
            if (err) {
                reject(err)
                return
            }
            const imgPath = files.img[0].path
            var imgFilename = imgPath.split("\\")[imgPath.split("\\").length - 1]
            resolve(imgFilename)
            return
        })
    })
}

//统一文件上传中心，如果上传过程中用户断开连接了会自动删除正在上传的temp文件
export function UploadFiles(req) {
    let form = new multiparty.Form({
        uploadDir: "public/files/temp",
    })
    return new Promise((resolve, reject) => {
        form.parse(req, function (err, field, files) {
            if (err) {
                reject(err)
                return
            }

            resolve(files.file[0])
            return
        })
    })
}

/**
 * @list 人员列表，包含学号工号、姓名
 * @role 插入的人的角色 student teacher
 */
export function InsertUsersReturnIDs(list, role) {
    let IDs = []

    let findOutOrInsert = e => {
        return new Promise((resolve, reject) => {
            User.findOne({
                $and: [{ username: e.username }, { isUsed: true }],
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
        .then(e => {
            //console.log(e)
            return e
        })
        .catch(err => {
            return err
        })
}

/**
 *
 * @param {_id} courseID
 * @param {number} roles
 * @param {req} req
 */
export function CheckCourseAvailableAndReqUserHasPermission(courseID, roles, req) {
    let selection = ["studentList", "partnerTeacher", "chiefTeacher", "isUsed"]
    return new Promise((resolve, reject) => {
        let validate = /^[a-fA-F0-9]{24}$/.test(courseID)
        if (!validate) {
            return reject({
                code: 404,
                message: "error",
            })
        }
        Course.findById(courseID)
            .select(selection.slice(roles))
            .then((course, err) => {
                if (err) {
                    return reject({
                        code: 30001,
                        message: "DataBase Error",
                    })
                }

                if (!course || course.isUsed === false) {
                    return reject({
                        code: 404,
                        message: "该课程不存在",
                    })
                }

                /*
				既不是chief，也不是partner里的，也不是studentlist里的
				 p._id是object，要toString
				 studentList是空列表就不执行对应的some了
			 */
                let chiefTeacher = course.chiefTeacher
                let partnerTeacher = course.partnerTeacher || []
                let studentList = course.studentList || []
                let valid =
                    chiefTeacher._id.toString() === req.uid ||
                    partnerTeacher.some(p => p._id.toString() === req.uid) ||
                    studentList.some(p => p._id.toString() === req.uid)
                if (!valid) {
                    return reject({
                        code: 401,
                        message: "401 Not Permission",
                    })
                }

                return resolve()
            })
    })
}
