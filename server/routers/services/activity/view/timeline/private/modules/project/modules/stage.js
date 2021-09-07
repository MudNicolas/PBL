import Router from "express"

import Stage from "#models/Stage.js"
import { copySources, transNewContentSourceUrl } from "#services/tools/index.js"

let router = Router()

router.post("/new", async (req, res) => {
    let { stageOptions } = req.body
    let { project } = req

    if (["underApprove", "underConcludeApprove", "conclude"].includes(project.status)) {
        res.json({
            code: "当前不可新建阶段",
        })
        return
    }

    let status = project.status

    let time = new Date()

    let authorUID = [req.uid]
    let authorID = req.uid
    if (project.authorType === "group") {
        let { group } = req
        authorUID = group.groupMember
        authorID = group._id
    }
    let stage = {
        authorID,
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
        let originStage = await Stage.findOne({
            _id: stageID,
            notification: {
                $exists: false,
            },
        })
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

export default router
