import Router from "express"
import Course from "#models/Course.js"
import User from "#models/User.js"

let router = Router()

router.get("/get", (req, res) => {
    let { course } = req
    course
        .execPopulate({ path: "group.groupMember", select: "name username" })
        .then((course, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }
            let { group, studentList } = course.toJSON()
            res.json({
                code: 20000,
                data: {
                    group: group,
                    studentNumber: studentList.length,
                },
            })
        })
})

/**
 *
 * @param {array} group
 * @param {student _id} sid
 * @description 该sid是否在课程的一个group中
 */
function studentInGroup(group, sid) {
    return group.some(g => {
        return g.groupMember.some(m => {
            return m.toString() === sid.toString()
        })
    })
}

router.get("/unGroupedStudents/get", (req, res, next) => {
    let { course } = req
    course
        .execPopulate({
            path: "studentList",
            select: "name username",
            options: {
                sort: {
                    username: 1,
                },
            },
        })
        .then((course, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }
            let { studentList, group } = course
            //filter some 确定不在所有组内的学生
            let unGroupedStudents = studentList.filter(s => {
                if (!studentInGroup(group, s._id)) {
                    return s
                }
            })

            res.json({
                code: 20000,
                data: {
                    unGroupedStudents: unGroupedStudents,
                },
            })
        })
})

router.post("/create", (req, res) => {
    let { course } = req
    let { targetGroup } = req.body
    if (targetGroup.groupMembersID.length === 0) {
        res.json({
            code: 31004,
            message: "组员不能为空",
        })
        return
    }

    let { studentList } = course
    let { groupMembersID } = targetGroup
    let isNotInTheCourse = groupMembersID.some(m => {
        return studentList.indexOf(m) === -1
    })

    if (isNotInTheCourse) {
        res.json({
            code: 31003,
            message: "目标组中有学生不属于本课程",
        })
        return
    }
    let { group } = course
    //如果groupMemberID有已经成组的
    let hasGrouped = groupMembersID.some(m_id => {
        if (studentInGroup(group, m_id)) {
            return true
        }
    })
    if (hasGrouped) {
        res.json({
            code: 31002,
            message: "目标组中已有学生成组",
        })
        return
    }

    let groupName = targetGroup.name || ""
    let groupSchema = {
        name: groupName,
        groupMember: groupMembersID,
    }
    course.group.push(groupSchema)
    course.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }
        res.json({
            code: 20000,
        })
    })
})

router.all("*", (req, res, next) => {
    let { course } = req
    let groupID = req.query.groupID || req.body.groupID || req.body.targetGroup._id

    let validate = /^[a-fA-F0-9]{24}$/.test(groupID)
    if (!validate) {
        res.json({
            code: 404,
            message: "error",
        })
        return
    }

    validate = course.group.some(g => g._id.toString() === groupID)
    if (!validate) {
        res.json({
            code: 31005,
            message: "该组不存在",
        })
        return
    }
    next()
})

router.get("/editData/get", (req, res) => {
    let { course } = req
    let { groupID } = req.query
    course
        .execPopulate({
            path: "studentList",
            select: "name username",
            options: {
                sort: {
                    username: 1,
                },
            },
        })
        .then(async (course, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }
            //editSourceData 课程中未成组的学生
            let editSourceData = course.studentList.filter(s => {
                if (!studentInGroup(course.group, s._id)) {
                    return s
                }
            })

            let groupMembersID, groupName
            for (let g of course.group) {
                if (g._id.toString() === groupID.toString()) {
                    groupMembersID = g.groupMember
                    groupName = g.name
                    break
                }
            }

            let groupData = await User.find({
                _id: { $in: groupMembersID },
            })
                .select("name username")
                .exec()
            editSourceData = [...editSourceData, ...groupData]

            res.json({
                code: 20000,
                data: {
                    editSourceData: editSourceData,
                    groupMembersID: groupMembersID,
                    groupName: groupName,
                },
            })
        })
})

router.post("/edit", (req, res) => {
    let { course } = req
    let { targetGroup } = req.body
    if (targetGroup.groupMembersID.length === 0) {
        res.json({
            code: 31004,
            message: "组员不能为空",
        })
        return
    }
    let groupID = targetGroup._id

    let { studentList } = course
    let { groupMembersID } = targetGroup
    let isNotInTheCourse = groupMembersID.some(m => {
        return studentList.indexOf(m) === -1
    })

    if (isNotInTheCourse) {
        res.json({
            code: 31003,
            message: "目标组中有学生不属于本课程",
        })
        return
    }

    let { group } = course
    let otherGroup = group.filter(g => g._id.toString() !== groupID)
    //如果groupMemberID有在其他组已经成组的
    let hasGrouped = groupMembersID.some(m_id => {
        if (studentInGroup(otherGroup, m_id)) {
            return true
        }
    })
    if (hasGrouped) {
        res.json({
            code: 31002,
            message: "目标组中已有学生成组",
        })
        return
    }

    for (let g of course.group) {
        if (g._id.toString() === groupID) {
            g.name = targetGroup.name
            g.groupMember = targetGroup.groupMembersID
            break
        }
    }
    course.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }
        res.json({
            code: 20000,
        })
    })
})

router.delete("/delete", (req, res) => {
    let { courseID, groupID } = req.body
    Course.updateOne({ _id: courseID }, { $pull: { group: { _id: groupID } } }).then((c, err) => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }
        res.json({
            code: 20000,
        })
    })
})

export default router
