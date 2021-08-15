import crypto from "crypto"
import md5 from "js-md5"
import multiparty from "multiparty"
import User from "#models/User.js"
import Course from "#models/Course.js"
import { DEFAULT_PASSWORD, SECRET_KEY, IV, SERVER_ADDRESS } from "#root/settings.js"

import EditorImage from "#models/EditorImage.js"

import cheerio from "cheerio"
import EditorVideo from "#models/EditorVideo.js"

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

export function UploadEditorVideo(req) {
    var form = new multiparty.Form({
        uploadDir: "public/files",
    })
    return new Promise((resolve, reject) => {
        form.parse(req, function (err, field, files) {
            if (err) {
                reject(err)
                return
            }
            const videoPath = files.video[0].path
            var videoFilename = videoPath.split("\\")[videoPath.split("\\").length - 1]
            resolve(videoFilename)
            return
        })
    })
}

//统一文件上传中心，如果上传过程中用户断开连接了会自动删除正在上传的temp文件
export function UploadFiles(req) {
    let form = new multiparty.Form({
        uploadDir: "public/files",
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
                newUser.save((err, theUser) => {
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
 * @param {number} roles {0->all,1->teacher,2->chiefTeacher}
 * @param {req} req
 */
export function CheckCourseAvailableAndReqUserHasPermission(courseID, roles, req) {
    let selection = ["studentList", "partnerTeacher", "chiefTeacher"]
    return new Promise((resolve, reject) => {
        let validate = /^[a-fA-F0-9]{24}$/.test(courseID)
        if (!validate) {
            return reject({
                code: 404,
                message: "error",
            })
        }
        Course.findById(courseID).then((course, err) => {
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

            let permissionCheck = {
                chiefTeacher: {},
                partnerTeacher: [],
                studentList: [],
            }
            for (let i of selection.slice(roles)) {
                permissionCheck[i] = course[i]
            }
            let valid =
                permissionCheck.chiefTeacher._id.toString() === req.uid ||
                permissionCheck.partnerTeacher.some(p => p._id.toString() === req.uid) ||
                permissionCheck.studentList.some(p => p._id.toString() === req.uid)
            if (!valid) {
                return reject({
                    code: 401,
                    message: "401 Not Permission",
                })
            }

            return resolve(course)
        })
    })
}

//editor图片上传
export function editorImageUpload(req) {
    return new Promise((resolve, reject) => {
        UploadImg("editor", req)
            .then(imageFileName => {
                let uploadedImage = new EditorImage({
                    serverFilename: imageFileName,
                    submitUID: req.uid,
                    uploadTime: Date.now(),
                    type: "editorImage",
                    sectionID: req.sectionID,
                    courseID: req.courseID,
                })
                uploadedImage.save((err, f) => {
                    if (err) {
                        console.log(err)
                        reject({
                            code: 30001,
                            message: "DataBase Error",
                        })
                        return
                    }
                    let path =
                        SERVER_ADDRESS + "/public/img/editor/" + f.serverFilename + "?_id=" + f._id
                    resolve({
                        link: path,
                        imageID: f._id,
                    })
                })
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
}

//editor视频上传
export function editorVideoUpload(req) {
    return new Promise((resolve, reject) => {
        UploadEditorVideo(req)
            .then(videoFilename => {
                let uploadedImage = new EditorVideo({
                    serverFilename: videoFilename,
                    submitUID: req.uid,
                    uploadTime: Date.now(),
                    type: "editorVideo",
                    sectionID: req.sectionID,
                    courseID: req.courseID,
                })
                uploadedImage.save((err, f) => {
                    if (err) {
                        console.log(err)
                        reject({
                            code: 30001,
                            message: "DataBase Error",
                        })
                        return
                    }
                    let path =
                        SERVER_ADDRESS + "/public/files/" + f.serverFilename + "?_id=" + f._id
                    resolve({
                        link: path,
                        videoID: f._id,
                    })
                })
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
}

export function contentImageResolution(htmlContent) {
    const $ = cheerio.load(htmlContent)
    let images = $("img")
    let imagesID = []
    for (let e of images) {
        let imageID = e.attribs.src.split("?")[1].split("=")[1]
        if (/^[a-fA-F0-9]{24}$/.test(imageID)) {
            imagesID.push(imageID)
        }
    }
    return imagesID
}
export function contentVideoResolution(htmlContent) {
    const $ = cheerio.load(htmlContent)
    let videos = $("video")
    let videosID = []
    for (let e of videos) {
        let videoID = e.attribs.src.split("?")[1].split("=")[1]
        if (/^[a-fA-F0-9]{24}$/.test(videoID)) {
            videosID.push(videoID)
        }
    }
    return videosID
}

export function processContentSource(stage, content) {
    return new Promise((resolve, reject) => {
        //resolute images
        let imagesID = contentImageResolution(content)
        let videosID = contentVideoResolution(content)
        //对比allUploadedImages,将差集全部isusedFalse，imagesID isused true
        let allUploadedImagesIDSet = stage.allUploadedImages.map(e => {
            return e.toString()
        })
        let allUploadedVideosIDSet = stage.allUploadedVideos.map(e => {
            return e.toString()
        })
        //未使用的images
        let notUsedImagesID = allUploadedImagesIDSet.filter(e => imagesID.indexOf(e) === -1)
        let notUsedVideosID = allUploadedVideosIDSet.filter(e => videosID.indexOf(e) === -1)

        let arrayProcess = []
        for (let e of notUsedImagesID) {
            arrayProcess.push(turnSource(EditorImage, e, false))
        }
        for (let e of imagesID) {
            arrayProcess.push(turnSource(EditorImage, e, true))
        }
        for (let e of notUsedVideosID) {
            arrayProcess.push(turnSource(EditorVideo, e, false))
        }
        for (let e of videosID) {
            arrayProcess.push(turnSource(EditorVideo, e, true))
        }
        Promise.all(arrayProcess)
            .then(() => {
                return resolve({ imagesID, videosID })
            })
            .catch(() => {
                return reject({ message: "资源处理出现错误" })
            })

        function turnSource(model, _id, status) {
            return new Promise((resolve, reject) => {
                model
                    .findById(_id)
                    .select("isNeeded")
                    .then((e, err) => {
                        if (err || !e) {
                            return reject(err)
                        }
                        e.isNeeded = status
                        e.save(err => {
                            if (err) {
                                return reject(err)
                            }
                            return resolve()
                        })
                    })
            })
        }
    })
}
