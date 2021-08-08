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

router.use((req, res, next) => {
    let { activity, uid } = req
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
        req.group = userGroup
    }
    next()
})

router.get("/private/get", (req, res) => {
    let { activity } = req

    let authorID = req.uid
    if (activity.options.authorType === "group") {
        let { group } = req
        authorID = group._id
    }

    let activityID = activity._id

    TimeLineProject.findOne({
        authorID,
        activityID,
    })
        .select("name intro time stages status")
        .then((project, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }

            res.json({
                code: 20000,
                data: project,
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
        let { group } = req
        let valid = group.groupMember.some(m => {
            m.toString() === sid.toString()
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

router.post("/private/project/create", (req, res) => {
    let { project, activityID } = req.body
    let { name, intro } = project
    if (!name) {
        res.json({
            message: "项目名称不能为空",
        })
        return
    }
    let { activity } = req
    let status = "normal"

    if (activity.options.isNeedApprove) {
        status = "beforeApprove"
    }

    let authorType = activity.options.authorType
    let authorID = req.uid
    if (authorType === "group") {
        let { group } = req

        authorID = group._id
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

router.post("/private/project/stage/new", (req, res) => {
    let { stageOptions } = req.body
    let { project } = req
    console.log(stageOptions)
    //新建全新的空白stage

    //新阶段的status继承自project
    let status = project.status

    let time = new Date()
    let stage = {
        createTime: time,
        status,
        editLog: [
            {
                uid: req.uid,
                time,
                operation: "创建",
            },
        ],
    }

    if (stageOptions.creatMethod === "inheritance") {
        let stageID = stageOptions.inhertStageID
        let originStage = project.stages.find(s => s._id.toString === stageID.toString())
        if (!originStage) {
            res.json({
                message: "该阶段不存在",
            })
            return
        }
        //继承内容
        stage.content = originStage.content
    } else {
        stage.authorUID = [req.uid]
        if (project.authorType === "group") {
            let { group } = req
            stage.authorUID = group.groupMember
        }
    }

    project.stages.push(stage)
    project.save((err, p) => {
        if (err) {
            res.json({
                code: 30001,
                message: "Database Error",
            })
            return
        }
        let _id = p.stages.slice(-1)._id
        res.json({
            code: 20000,
            data: _id,
        })
    })
})

export default router
