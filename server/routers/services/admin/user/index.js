import Router from "express"
import User from "#models/User.js"
import Course from "#models/Course.js"
import { InsertUsersReturnIDs } from "#services/tools/index.js"
import md5 from "js-md5"
import { DEFAULT_PASSWORD } from "#root/settings.js"

let router = Router()

router.get("/role/all/get", (req, res) => {
    let { role, limit, page } = req.query
    const DEFAULT_LIMIT = 30
    const DEFAULT_PAGE = 1
    limit = Number(limit) || DEFAULT_LIMIT
    page = Number(page) || DEFAULT_PAGE

    User.find({
        role: role,
        isUsed: true,
    })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("name avatar username")
        .sort({
            username: 1,
        })
        .then(async users => {
            let userNum = await User.countDocuments({
                role: role,
                isUsed: true,
            }).exec()
            res.json({
                code: 20000,
                data: { users, userNum },
            })
        })
})

router.post("/role/submit", (req, res) => {
    let { role, userList } = req.body
    if (userList.length === 0) {
        res.json({
            message: "列表不能为空",
        })
        return
    }

    InsertUsersReturnIDs(userList, role)
        .then(() => {
            res.json({
                code: 20000,
            })
        })
        .catch(err => {
            console.log(err, "insert stuednt to User")
            res.json({
                message: "导入失败：" + err,
            })
            return
        })
})

router.get("/role/search", (req, res) => {
    let { queryString, role } = req.query
    const reg = new RegExp(queryString, "i")
    //find 教师角色的，不是创建课程的教师，返回_id,username,name
    User.find(
        {
            $or: [{ name: { $regex: reg } }, { username: { $regex: reg } }],
            role,
            $where: "(this.role.length===1)",
        },
        ["_id", "username", "name"],
        (err, result) => {
            if (err) {
                console.log(err)
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }
            result = result.map(e => ({
                value: `${e.username} - ${e.name}`,
                _id: e._id,
            }))
            res.json({
                code: 20000,
                data: result,
            })
        }
    )
})

router.get("/getInfo", (req, res) => {
    let { _id } = req.query
    User.findById(_id)
        .select("username name intro role avatar")
        .then(async user => {
            let course = await Course.find({
                $or: [{ chiefTeacher: _id }, { partnerTeacher: _id }, { studentList: _id }],
            })
                .select("name chiefTeacher")
                .populate({
                    path: "chiefTeacher",
                    select: "name",
                })
                .then(courses => {
                    return courses.map(e => ({ name: e.name, chief: e.chiefTeacher.name }))
                })
            res.json({
                code: 20000,
                data: { user, course },
            })
        })
        .catch(err => {
            console.log(err)
            res.json({
                message: "Error",
            })
        })
})

//重置密码和删除用户验证权限，admin可以处理teacher，student，root可以处理全部
router.use((req, res, next) => {
    let { _id } = req.body
    let { role: operatorRole } = req
    User.findById(_id)
        .then(user => {
            let { role } = user
            if (role.includes("admin") && operatorRole !== "root") {
                return res.json({
                    message: "你无权操作此用户",
                })
            }
            req.targetUser = user
            return next()
        })
        .catch(err => {
            console.log(err)
            res.json({
                message: "Error",
            })
        })
})

router.post("/resetPWD", (req, res) => {
    let { targetUser } = req
    targetUser.password = md5(DEFAULT_PASSWORD)
    targetUser
        .save()
        .then(() => {
            res.json({
                code: 20000,
            })
        })
        .catch(err => {
            console.log(err)
            res.json({
                message: "Error",
            })
        })
})

router.delete("/removeUser", (req, res) => {
    let { targetUser } = req
    targetUser.isUsed = false
    targetUser
        .save()
        .then(() => {
            res.json({
                code: 20000,
            })
        })
        .catch(err => {
            console.log(err)
            res.json({
                message: "Error",
            })
        })
})

export default router
