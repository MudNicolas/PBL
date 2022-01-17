import Router from "express"
import Course from "#models/Course.js"

var router = Router()

router.get("/getAll", (req, res) => {
    let { limit, page, searchQuery } = req.query

    const DEFAULT_LIMIT = 12
    const DEFAULT_PAGE = 1
    limit = Number(limit) || DEFAULT_LIMIT
    page = Number(page) || DEFAULT_PAGE

    const reg = new RegExp(searchQuery, "i")

    Course.find({
        name: { $regex: reg },
    })
        .skip((page - 1) * limit)
        .limit(limit)

        .select("studentList isUsed name chiefTeacher date")
        .populate({
            path: "chiefTeacher",
            select: "name",
        })
        .then(async courses => {
            let courseNum = await Course.countDocuments().exec()
            res.json({
                code: 20000,
                data: {
                    courseNum,
                    courses: courses.map(e => ({
                        name: e.name,
                        date: e.date,
                        chief: e.chiefTeacher,
                        studentNum: e.studentList.length,
                        isUsed: e.isUsed,
                    })),
                },
            })
        })
})

export default router
