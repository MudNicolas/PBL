import Router from "express"
let router = Router()
import TimeLineProject from "#models/TimeLineProject.js"
import Stage from "#models/Stage.js"
import { copySources, transNewContentSourceUrl } from "#services/tools.js"

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
        .select("name intro time status")
        .then((project, err) => {
            if (err) {
                res.json({
                    code: 30001,
                    message: "DataBase Error",
                })
                return
            }

            if (!project) {
                res.json({
                    code: 20000,
                    data: {
                        status: "NoProject",
                    },
                })
                return
            }

            Stage.find({
                timelineProjectID: project._id,
            })
                .select("subjectName sketch createTime isPublic status isUsed")
                .then(stages => {
                    res.json({
                        code: 20000,
                        data: { project, stages },
                    })
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

router.post("/private/project/stage/new", async (req, res) => {
    let { stageOptions } = req.body
    let { project } = req
    console.log(stageOptions)
    //新建全新的空白stage

    //新阶段的status继承自project
    let status = project.status

    let time = new Date()

    let authorUID = [req.uid]
    if (project.authorType === "group") {
        let { group } = req
        authorUID = group.groupMember
    }
    let stage = {
        authorUID,
        timelineProjectID: project._id,
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

    //继承时，复制content、contentImage、contentVideo、file
    if (stageOptions.creatMethod === "inheritance") {
        let stageID = stageOptions.inhertStageID
        let originStage = await Stage.findById(stageID)
            .populate([
                {
                    path: "images",
                    select: "serverFilename submitUID sectionID courseID type",
                },
                {
                    path: "videos",
                    select: "serverFilename submitUID sectionID courseID type",
                },
                {
                    path: "files",
                    select: "serverFilename originalFilename size submitUID type",
                },
            ])
            .exec()

        if (!originStage) {
            res.json({
                message: "该阶段不存在",
            })
            return
        }

        let { images, videos, files } = originStage.toJSON()

        let [iErr, targetImagesID, imagesServerFilename] = await copySources(
            "public/img/editor/",
            "image",
            images
        )
        let [vErr, targetVideosID, videoServerFilename] = await copySources(
            "public/files/",
            "video",
            videos
        )
        let [fErr, targetFilesID] = await copySources("public/files/", "file", files)
        if (iErr || vErr || fErr) {
            console.log(iErr, vErr, fErr)
            return res.json({
                message: "服务器出现错误",
            })
        }
        stage.images = targetImagesID
        stage.allUploadedImages = targetImagesID
        stage.videos = targetVideosID
        stage.allUploadedVideos = targetVideosID
        stage.files = targetFilesID
        stage.allUploadedFiles = targetFilesID
        //将content的src替换
        stage.content = transNewContentSourceUrl(
            originStage.content,
            targetImagesID,
            imagesServerFilename,
            targetVideosID,
            videoServerFilename
        )
    }

    Stage.find({
        timelineProjectID: project._id,
    })
        .select("editable")
        .then(stages => {
            //新建阶段，之前阶段不可编辑
            for (let e of stages) {
                e.editable = false
                e.save(err => {})
            }

            Stage(stage).save((err, s) => {
                if (err) {
                    console.log(err, stage)
                    res.json({
                        code: 30001,
                        message: "Database Error",
                    })
                    return
                }
                res.json({
                    code: 20000,
                    data: s._id,
                })
            })
        })
})

import stage from "./stage.js"
router.use("/stage", stage)

export default router
