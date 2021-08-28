import Router from "express"

let router = Router()

router.use((req, res, next) => {
    let { commentData, course } = req
    let { chiefTeacher, partnerTeacher } = course
    if (
        commentData.commentUser.toString() !== req.uid &&
        chiefTeacher.toString() !== req.uid &&
        !partnerTeacher.find(e => e.toString() === req.uid)
    ) {
        res.json({
            code: 401,
        })
        return
    }
    next()
})

export default router
