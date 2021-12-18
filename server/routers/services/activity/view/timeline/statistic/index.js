import Router from "express"
let router = Router()

import Comment from "#models/Comment.js"

router.get("/get", (req, res) => {
    let { activity, uid, course } = req

    let authorType = activity.options.authorType
    let commentTemplate = activity.options.commentTemplate

    let { studentList } = course
    let classData = getClassData(activity._id, studentList, commentTemplate)
    //console.log(course)
    if (authorType === "personal") {
        //uid
    } else {
        //uid find group  in course
    }
})

async function getClassData(activityID, studentList, commentTemplate) {
    //最多comment数
    let sortCommentNumberList = await Comment.aggregate([
        {
            $match: {
                activityID,
                isSubmit: true,
                isUsed: true,
                commentUser: { $in: studentList },
            },
        },
        {
            $project: {
                _id: 1,
                commentUser: 1,
                comment: 1,
                reply: 1,
            },
        },
        {
            $group: {
                _id: "$commentUser",
                commentSum: { $sum: 1 },
            },
        },
        {
            $sort: {
                commentSum: -1,
            },
        },
    ]).exec()

    //最多reply数
    let sortReplyNumberList = await Comment.aggregate([
        {
            $unwind: "$reply",
        },
        {
            $match: {
                activityID,
                isSubmit: true,
                isUsed: true,
                "reply.fromUser": { $in: studentList },
            },
        },
        {
            $project: {
                _id: 1,
                commentUser: 1,
                comment: 1,
                reply: 1,
            },
        },
        {
            $group: {
                _id: "$reply.fromUser",
                replySum: { $sum: 1 },
            },
        },
        {
            $sort: {
                replySum: -1,
            },
        },
    ]).exec()

    /**
     * @default 私有空间的comment或者无模板的comment
     * @commentTemplate array<String> 用到的模板的list
     */
    commentTemplate = [...commentTemplate, "default"]
    //按entry区分的最多评论数，不统计空entry
    let sortReplyEntryList = await Comment.aggregate([
        {
            $unwind: "$comment",
        },
        {
            $match: {
                activityID,
                isSubmit: true,
                isUsed: true,
                commentUser: { $in: studentList },
                "comment.content": { $ne: "" },
            },
        },
        {
            $match: {
                "comment.entry": { $in: commentTemplate },
            },
        },
        {
            $project: {
                _id: 1,
                commentUser: 1,
                comment: 1,
            },
        },
        {
            $group: {
                _id: "$comment.entry",
                replySum: { $sum: 1 },
                user: { $push: "$commentUser" },
            },
        },
        {
            $sort: {
                replySum: -1,
            },
        },
    ]).exec()

    //将没有发言的entry标记为0
    for (let c of commentTemplate) {
        if (!sortReplyEntryList.find(e => e._id === c.toString())) {
            sortReplyEntryList.push({
                _id: c.toString(),
                replySum: 0,
                user: [],
            })
        }
    }
    console.log(sortReplyEntryList)
    //最多评论数
    let dataMostComment = sortCommentNumberList[0] ? sortCommentNumberList[0].commentSum : 0
    //最多回复数
    let dataMostReply = sortReplyNumberList[0] ? sortReplyNumberList[0].replySum : 0
    //每条entry最多评论数
    let dataMostEntryComment = sortReplyEntryList.map(e => ({
        entry: e._id,
        dataMostEntryComment: e.replySum,
    }))
    //学生数
    let numberStudent = studentList.length || 1 //防止没学生时div0
    //班级平均评论数
    let dataAvgComment = Math.round(
        sortCommentNumberList
            .map(e => e.commentSum)
            .reduce(function (prev, cur) {
                return prev + cur
            }, 0) / numberStudent
    )
    //班级平均回复数
    let dataAvgReply = Math.round(
        sortReplyNumberList
            .map(e => e.replySum)
            .reduce(function (prev, cur) {
                return prev + cur
            }, 0) / numberStudent
    )
    //每条entry的班级平均回复数
    let avgEntry = sortReplyEntryList.map(e => ({
        entry: e._id,
        dataAvgEntryComment: Math.round(e.replySum / e.user.length),
    }))
    console.log({
        most: {
            dataMostComment,
            dataMostReply,
            dataMostEntryComment,
        },
        avg: {
            dataAvgComment,
            dataAvgReply,
            avgEntry,
        },
    })
    return
}

export default router
