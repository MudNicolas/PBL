import Router from "express"
import User from "#models/User.js"
import { InsertUsersReturnIDs } from "#services/tools/index.js"

var router = Router()

router.get("/role/all/get", (req, res) => {
    let { role } = req.query
    User.find({
        role: role,
        isUsed: true,
        $where: "(this.role.length===1)", //仅包含此角色的user
    })
        .select("name avatar username")
        .sort({
            username: 1,
        })
        .then(users => {
            res.json({
                code: 20000,
                data: { users },
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

export default router
