import Router from "express"
let router = Router()

function findStudentGroup(group, sid) {
    return group.find(g => g.groupMember.some(m => m.toString() === sid.toString()))
}

router.use((req, res, next) => {
    let { activity, uid } = req
    if (activity.options.authorType === "group" && req.role === "student") {
        let { group } = req.course
        let userGroup = findStudentGroup(group, uid)
        if (!userGroup) {
            res.json({
                code: 34001,
                message: "你不属于任何小组",
            })
            return
        }
        req.group = userGroup
    }
    next()
})

export default router
