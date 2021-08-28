import Router from "express"
let router = Router()

//高级操作验权限
router.post("*", (req, res, next) => {
    //教师可get，不可post
    if (req.method === "GET" && req.role === "teacher") {
        return next()
    }
    let { project } = req
    //个人项目，作者id与uid不匹配
    if (project.authorType === "personal" && project.authorID.toString() !== req.uid.toString()) {
        res.json({
            code: 401,
        })
        return
    }
    //小组项目，小组内无uid
    if (project.authorType === "group") {
        let { group } = req
        let valid = group.groupMember.some(m => m.toString() === req.uid.toString())

        if (!valid) {
            res.json({
                code: 401,
            })
            return
        }
    }
    next()
})

export default router
