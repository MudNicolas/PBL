import Router from "express"
import mongoose from "mongoose"

let router = Router()

import Comment from "#models/Comment.js"
import User from "#models/User.js"

router.get("/get", async (req, res) => {
    let { activity, uid, course } = req

    let authorType = activity.options.authorType
    let commentTemplate = activity.options.commentTemplate || []
    commentTemplate.push("default")
    let { studentList } = course
    //console.log(studentList, "studentlist")
    let classData = await getClassData(
        activity._id,
        authorType,
        studentList,
        commentTemplate,
        course.group
    )
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

    let personalOrGroupTotalData = await getPersonalOrGroupTotalData(
        activity._id,
        userQuery,
        commentTemplate
    )
    //console.log(personalOrGroupTotalData)
    let groupMemberData = []
    if (authorType !== "personal") {
        groupMemberData = await getGroupMemberData(activity._id, userQuery, commentTemplate)
    }
    let data = { classData, personalOrGroupTotalData, groupMemberData, commentTemplate }
    //data.privateData = authorType === "personal" ? [personalOrGroupTotalData] : groupMemberData
    res.json({
        code: 20000,
        data,
    })
})

/**
 * @param {ObjectID} activityID
 * @param {List<ObjectID>} studentList
 * @param {List<String>} commentTemplate
 * @description 输入activityID，一个组的studentList，commentTemplate，返回这个组的commentNumber,replyNumber,entryCommentNumber
 */
async function getPersonalOrGroupTotalData(activityID, studentList, commentTemplate) {
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
        let { name, _id } = await User.findById(e)
            .select({
                name: 1,
            })
            .exec()
        data.push({
            name,
            _id,
            ...(await getPersonalOrGroupTotalData(activityID, [e], commentTemplate)),
        })
    }
    return data
}

//将classData进行个人和小组data的区分
async function getClassData(activityID, authorType, studentList, commentTemplate, courseGroup) {
    if (authorType === "personal") {
        return await getPersonalTypeClassData(activityID, studentList, commentTemplate)
    } else {
        return await getGroupTypeClassData(activityID, courseGroup, commentTemplate)
    }
}

async function getGroupTypeClassData(activityID, courseGroup, commentTemplate) {
    let data = []
    for (let g of courseGroup) {
        data.push(await getPersonalOrGroupTotalData(activityID, g.groupMember, commentTemplate))
    }
    //console.log(data[0].dataPersonalOrGroupEntryCommentNumber)
    let dataMostComment = Math.max(...data.map(e => e.dataPersonalOrGroupCommentNumber))
    let dataMostReply = Math.max(...data.map(e => e.dataPersonalOrGroupReplyNumber))

    let dataMostEntryComment = commentTemplate.map(c => ({
        entry: c,
        dataEntryComment: Math.max(
            ...data.map(
                e =>
                    e.dataPersonalOrGroupEntryCommentNumber.find(entry => entry.entry === c)
                        .dataEntryComment || 0
            )
        ),
    }))
    //班级小组分组平均评论数
    let groupNumber = courseGroup.length || 1
    let dataAvgComment = Math.round(
        data
            .map(e => e.dataPersonalOrGroupCommentNumber)
            .reduce(function (prev, cur) {
                return prev + cur
            }, 0) / groupNumber
    )
    //班级小组分组平均回复数
    let dataAvgReply = Math.round(
        data
            .map(e => e.dataPersonalOrGroupReplyNumber)
            .reduce(function (prev, cur) {
                return prev + cur
            }, 0) / groupNumber
    )
    //每条entry的班级小组分组平均回复数
    let dataAvgEntry = commentTemplate.map(c => ({
        entry: c,
        dataEntryComment:
            data
                .map(
                    e =>
                        e.dataPersonalOrGroupEntryCommentNumber.find(entry => entry.entry === c)
                            .dataEntryComment || 0
                )
                .reduce(function (prev, cur) {
                    return prev + cur
                }, 0) / groupNumber,
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
            dataAvgEntry,
        },
    }
}

async function getPersonalTypeClassData(activityID, studentList, commentTemplate) {
    let { sortCommentNumberList, sortReplyNumberList, sortEntryCommentList } =
        await getCommentAndReplyData(activityID, studentList, commentTemplate)
    //最多评论数

    let dataMostComment = sortCommentNumberList[0] ? sortCommentNumberList[0].commentSum : 0
    //最多回复数
    let dataMostReply = sortReplyNumberList[0] ? sortReplyNumberList[0].replySum : 0
    //每条entry最多评论数
    let dataMostEntryComment = sortEntryCommentList.map(e => ({
        entry: e._id,
        dataEntryComment: e.entryCommentSum,
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
    let dataAvgEntry =
        sortEntryCommentList.map(e => ({
            entry: e._id,
            dataEntryComment: Math.round(e.entryCommentSum / e.user.length),
        })) || 0

    return {
        most: {
            dataMostComment,
            dataMostReply,
            dataMostEntryComment,
        },
        avg: {
            dataAvgComment,
            dataAvgReply,
            dataAvgEntry,
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
