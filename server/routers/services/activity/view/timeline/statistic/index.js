import Router from "express"
import mongoose from "mongoose"

let router = Router()

import Comment from "#models/Comment.js"

router.get("/get", async (req, res) => {
    let { activity, uid, course } = req

    let authorType = activity.options.authorType
    let commentTemplate = activity.options.commentTemplate

    let { studentList } = course
    //console.log(studentList, "studentlist")
    let classData = await getClassData(activity._id, studentList, commentTemplate)
    //console.log(classData)
    //获取组内或个人数据
    let userQuery = []
    if (authorType === "personal") {
        userQuery.push(mongoose.Types.ObjectId(uid))
    } else {
        //console.log(course.group)
        let theGroup = course.group.find(e => e.groupMember.indexOf(uid) !== -1)
        if (theGroup) {
            userQuery = theGroup.groupMember
        }
    }

    let personalOrGroupData = await getPersonalOrGroupData(activity._id, userQuery, commentTemplate)
    console.log(personalOrGroupData)
})

async function getPersonalOrGroupData(activityID, studentList, commentTemplate) {
    //console.log(activityID, studentList, commentTemplate)
    let { sortCommentNumberList, sortReplyNumberList, sortReplyEntryList } =
        await getCommentAndReplyData(activityID, studentList, commentTemplate)

    //console.log(sortCommentNumberList, sortReplyNumberList, sortReplyEntryList)

    let dataGroupCommentNumber = sortCommentNumberList
        .map(e => e.commentSum)
        .reduce(function (prev, cur) {
            return prev + cur
        }, 0)

    let dataGroupReplyNumber = sortReplyNumberList
        .map(e => e.replySum)
        .reduce(function (prev, cur) {
            return prev + cur
        }, 0)

    let dataGroupEntryCommentNumber = sortReplyEntryList.map(e => ({
        entry: e._id,
        dataEntryComment: e.replySum,
    }))

    return {
        dataGroupCommentNumber,
        dataGroupReplyNumber,
        dataGroupEntryCommentNumber,
    }
}

async function getClassData(activityID, studentList, commentTemplate) {
    let { sortCommentNumberList, sortReplyNumberList, sortReplyEntryList } =
        await getCommentAndReplyData(activityID, studentList, commentTemplate)
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

    return {
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
    }
}

async function getCommentAndReplyData(activityID, studentList, commentTemplate) {
    //comment数
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

    //reply数
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
    //按entry区分的评论数，不统计空entry
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
    //console.log(sortCommentNumberList, sortReplyNumberList, sortReplyEntryList)
    return {
        sortCommentNumberList,
        sortReplyNumberList,
        sortReplyEntryList,
    }
}

export default router
