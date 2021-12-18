import Router from "express"
import mongoose from "mongoose"

let router = Router()

import Comment from "#models/Comment.js"
import User from "#models/User.js"

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

    let personalOrGroupTotalData = await getpersonalOrGroupTotalData(
        activity._id,
        userQuery,
        commentTemplate
    )
    //console.log(personalOrGroupTotalData)
    let groupMemberData = []
    if (authorType !== "personal") {
        groupMemberData = await getGroupMemberData(activity._id, userQuery, commentTemplate)
    }
    console.log(groupMemberData)
})

async function getpersonalOrGroupTotalData(activityID, studentList, commentTemplate) {
    //console.log(activityID, studentList, commentTemplate)
    let { sortCommentNumberList, sortReplyNumberList, sortEntryCommentList } =
        await getCommentAndReplyData(activityID, studentList, commentTemplate)

    // console.log(sortCommentNumberList, sortReplyNumberList, sortEntryCommentList)

    let dataPersonalOrGroupCommentNumber = sortCommentNumberList
        .map(e => e.commentSum)
        .reduce(function (prev, cur) {
            return prev + cur
        }, 0)

    let dataPersonalOrGroupReplyNumber = sortReplyNumberList
        .map(e => e.replySum)
        .reduce(function (prev, cur) {
            return prev + cur
        }, 0)

    let dataPersonalOrGroupEntryCommentNumber = sortEntryCommentList.map(e => ({
        entry: e._id,
        dataEntryComment: e.entryCommentSum,
    }))

    return {
        dataPersonalOrGroupCommentNumber,
        dataPersonalOrGroupReplyNumber,
        dataPersonalOrGroupEntryCommentNumber,
    }
}

async function getGroupMemberData(activityID, studentList, commentTemplate) {
    let data = []
    for (let e of studentList) {
        data.push({
            name: await User.findById(e)
                .select({
                    name: 1,
                })
                .then(c => {
                    return c.name
                }),
            ...(await getpersonalOrGroupTotalData(activityID, [e], commentTemplate)),
        })
    }
    return data
}

async function getClassData(activityID, studentList, commentTemplate) {
    let { sortCommentNumberList, sortReplyNumberList, sortEntryCommentList } =
        await getCommentAndReplyData(activityID, studentList, commentTemplate)
    //最多评论数

    let dataMostComment = sortCommentNumberList[0] ? sortCommentNumberList[0].commentSum : 0
    //最多回复数
    let dataMostReply = sortReplyNumberList[0] ? sortReplyNumberList[0].replySum : 0
    //每条entry最多评论数
    let dataMostEntryComment = sortEntryCommentList.map(e => ({
        entry: e._id,
        dataMostEntryComment: e.entryCommentSum,
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
    let avgEntry = sortEntryCommentList.map(e => ({
        entry: e._id,
        dataAvgEntryComment: Math.round(e.entryCommentSum / e.user.length),
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
    let sortEntryCommentList = await Comment.aggregate([
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
                entryCommentSum: { $sum: 1 },
                user: { $push: "$commentUser" },
            },
        },
        {
            $sort: {
                entryCommentSum: -1,
            },
        },
    ]).exec()

    //将没有发言的entry标记为0
    for (let c of commentTemplate) {
        if (!sortEntryCommentList.find(e => e._id === c.toString())) {
            sortEntryCommentList.push({
                _id: c.toString(),
                entryCommentSum: 0,
                user: [],
            })
        }
    }
    //console.log(sortCommentNumberList, sortReplyNumberList, sortEntryCommentList)
    return {
        sortCommentNumberList,
        sortReplyNumberList,
        sortEntryCommentList,
    }
}

export default router
