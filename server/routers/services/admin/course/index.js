import Router from "express"
import Course from "#models/Course.js"
import Section from "#models/Section.js"
import Activity from "#models/Activity.js"

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
        .sort({ isUsed: -1, _id: 1 })
        .then(async courses => {
            let courseNum = await Course.countDocuments().exec()
            res.json({
                code: 20000,
                data: {
                    courseNum,
                    courses: courses.map(e => ({
                        _id: e._id,
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

router.get("/getInfo", (req, res) => {
    let { courseID: _id } = req.query
    Course.findById(_id)
        .select("studentList isUsed name chiefTeacher date partnerTeacher cover introduction")
        .populate([
            { path: "chiefTeacher", select: "name" },
            { path: "partnerTeacher", select: "name username" },
        ])
        .then(async course => {
            let section = await Section.find({
                courseID: course._id,
                isUsed: false,
            })
                .select("name isUsed date")
                .sort({ isUsed: -1, date: 1 })
                .exec()

            let activity = await Activity.find({
                sectionID: {
                    $in: await Section.find({
                        courseID: course._id,
                    })
                        .select("")
                        .exec(),
                },
                isUsed: false,
            })
                .select("name isUsed type sectionID")
                .populate({
                    path: "sectionID",
                    select: "name",
                })
                .sort({ isUsed: -1, _id: 1 })
                .exec()

            res.json({
                code: 20000,
                data: {
                    info: {
                        _id: course._id,
                        name: course.name,
                        date: course.date,
                        chiefTeacher: course.chiefTeacher,
                        partnerTeacher: course.partnerTeacher,
                        studentNum: course.studentList.length,
                        cover: course.cover,
                        isUsed: course.isUsed,
                        introduction: course.introduction,
                    },
                    section,
                    activity: activity.map(e => ({
                        _id: e._id,
                        name: e.name,
                        isUsed: e.isUsed,
                        type: e.type,
                        section: e.sectionID.name,
                    })),
                },
            })
        })
        .catch(err => {
            console.log(err)
            res.json({
                message: "Error",
            })
        })
})

router.delete("/remove", (req, res) => {
    let { _id } = req.body
    Course.findById(_id)
        .then(course => {
            course.isUsed = false
            course.save().then(() => {
                res.json({
                    code: 20000,
                })
            })
        })
        .catch(err => {
            console.log(err)
            res.json({
                message: "Error",
            })
        })
})

router.post("/recover", (req, res) => {
    let { model, _id } = req.body
    let map = {
        Section: Section,
        Course: Course,
        Activity: Activity,
    }
    map[model]
        .findById(_id)
        .then(e => {
            e.isUsed = true
            e.save().then(() => {
                res.json({
                    code: 20000,
                })
            })
        })
        .catch(err => {
            console.log(err)
            res.json({
                message: "Error",
            })
        })
})

router.post("/partner/remove", (req, res) => {
    let { courseID, uid } = req.body
    Course.findById(courseID)
        .select("partnerTeacher")
        .then(course => {
            course.partnerTeacher.remove(uid)
            course.save().then(() => {
                res.json({
                    code: 20000,
                })
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
