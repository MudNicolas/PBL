import Router from "express"
let router = Router()
import TimeLineProject from "#models/TimeLineProject.js"
import Mock from "mockjs"

function findStudentGroup(group, sid) {
    return group.find(g => {
        g.groupMember.some(m => {
            m.toString() === sid.toString()
        })
    })
}

router.get("/private/get", (req, res) => {
    let { activity, uid } = req

    let authorID
    if (activity.options.authorType === "group") {
        let { group } = req.course
        let userGroup = findStudentGroup(group, uid)
        if (!userGroup) {
            res.json({
                code: 34001,
                message: "你不属于任何小组",
            })
            return
        }
        authorID = userGroup._id
    } else {
        authorID = req.uid
    }
    let activityID = activity._id

    TimeLineProject.findOne({
        authorID,
        activityID,
    })
        .select("name intro time timeline status")
        .then((project, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }

            //mock start

            let list = []
            for (let i = 0; i < 10; i++) {
                let Random = Mock.Random
                list.push(
                    Mock.mock({
                        subjectName: "@ctitle",
                        authorUID: "@cname",
                        sketch: "@cparagraph",
                        status: Random.pick([
                            "approve",
                            "normal",
                            "conclude",
                            "rejected",
                            "abandoned",
                        ]), //approve,normal,conclude,rejected 审批阶段，正式阶段,结题
                        isUsed: Random.pick([true, false]),
                        createTime: new Date(),
                    })
                )
            }
            project.timeline = list

            console.log(project.timeline)
            //mock end

            res.json({
                code: 20000,
                data: project,
            })
        })
})

router.post("/private/project/create", (req, res) => {
    let { project, activityID } = req.body
    let { name, intro } = project
    if (!name) {
        res.json({
            message: "项目名称不能为空",
        })
        return
    }
    let { activity, course } = req
    let status = "normal"

    if (activity.options.isNeedApprove) {
        status = "approve"
    }

    let authorType = activity.options.authorType
    let authorID = req.uid
    if (authorType === "group") {
        let { group } = course
        let userGroup = findStudentGroup(group, uid)
        if (!userGroup) {
            res.json({
                code: 34001,
                message: "你不属于任何小组",
            })
            return
        }
        authorID = userGroup._id
    }
    let timelineProject = new TimeLineProject({
        name,
        intro,
        activityID,
        time: new Date(),
        authorID,
        authorType,
        status,
    })
    timelineProject.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "Database Error",
            })
            return
        }
        res.json({
            code: 20000,
        })
    })
})

//高级操作验权限
router.use((req, res, next) => {
    let { project } = req
    //个人项目，作者id与uid不匹配
    if (project.authorType === "personal" && project.authorID.toString() !== req.uid.toString()) {
        res.json({
            code: "401",
        })
        return
    }
    //小组项目，小组内无uid
    if (project.authorType === "group") {
        let groupID = project.authorID
        let { group } = req.course
        let valid = group.some(g => {
            g._id.toString() === groupID.toString() &&
                g.groupMember.some(m => {
                    m.toString() === sid.toString()
                })
        })
        if (!valid) {
            res.json({
                code: "401",
            })
            return
        }
    }
    next()
})
router.post("/private/project/edit", (req, res) => {
    let { project } = req
    let { editData } = req.body
    let { name, intro } = editData
    project.intro = intro
    project.name = name.trim()
    project.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "Database Error",
            })
            return
        }
        res.json({
            code: 20000,
        })
    })
})

export default router
