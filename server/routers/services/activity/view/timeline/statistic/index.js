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

    let userQueryTotalData = await getTotalDataOfStudentList(
        activity._id,
        userQuery,
        commentTemplate
    )
    //console.log(personalOrGroupTotalData)
    let userQueryDetailData = await getMemberDetailOfStudentList(
        activity._id,
        userQuery,
        commentTemplate
    )

    let data = processData(
        classData,
        userQueryTotalData,
        userQueryDetailData,
        commentTemplate,
        authorType
    )
    //console.log(data)
    res.json({
        code: 20000,
        data,
    })
})

function processData(
    classData,
    userQueryTotalData,
    userQueryDetailData,
    commentTemplate,
    authorType
) {
    let indicator = [
        {
            name: "评论数",
        },
        {
            name: "回复数",
        },
        ...commentTemplate.map(e => ({ name: e })),
    ]
    let processedData = {
        chartData: [],
        tableData: [],
        chartClassData: {},
    }
    let chartData = userQueryDetailData.map(student => ({
        title: `${student.name}互动情况`,
        name: student.name,
        data: [
            student.totalCommentNumber,
            student.totalReplyNumber,
            ...processEntryData(student.totalEntryCommentNumber, commentTemplate),
        ],
    }))

    if (authorType !== "personal") {
        chartData.push({
            title: `小组互动总情况`,
            data: [
                userQueryTotalData.totalCommentNumber,
                userQueryTotalData.totalReplyNumber,
                ...processEntryData(userQueryTotalData.totalEntryCommentNumber, commentTemplate),
            ],
        })
    }

    let tableData = userQueryDetailData.map(student => ({
        authorType,
        name: student.name,
        commentNumber: student.totalCommentNumber,
        groupCommentNumber: userQueryTotalData.totalCommentNumber,
        classMost:
            authorType === "personal"
                ? classData.personal.mostComment
                : classData.group.mostComment,
        classAvg:
            authorType === "personal" ? classData.personal.avgComment : classData.group.avgComment,
    }))

    let chartClassData = {
        personal: {
            most: [
                classData.personal.mostComment,
                classData.personal.mostReply,
                ...processEntryData(classData.personal.mostEntryComment, commentTemplate),
            ],
            avg: [
                classData.personal.avgComment,
                classData.personal.avgReply,
                ...processEntryData(classData.personal.avgEntryComment, commentTemplate),
            ],
        },
        group: {
            most: [
                classData.group.mostComment,
                classData.group.mostReply,
                ...processEntryData(classData.group.mostEntryComment, commentTemplate),
            ],
            avg: [
                classData.group.avgComment,
                classData.group.avgReply,
                ...processEntryData(classData.group.avgEntryComment, commentTemplate),
            ],
        },
    }
    processedData = {
        authorType,
        chartData,
        tableData,
        chartClassData,
        indicator,
    }
    return processedData
}

function processEntryData(entryCommentNumber, commentTemplate) {
    // console.log(entryCommentNumber, commentTemplate)
    return [
        ...commentTemplate.map(c => {
            return entryCommentNumber.find(e => e.entry === c).commentNumber || 0
        }),
    ]
}

/**
 * @param {ObjectID} activityID
 * @param {List<ObjectID>} studentList
 * @param {List<String>} commentTemplate
 * @description 输入activityID，一个组的studentList，commentTemplate，返回这个组的commentNumber,replyNumber,entryCommentNumber
 */
async function getTotalDataOfStudentList(activityID, studentList, commentTemplate) {
    //console.log(activityID, studentList, commentTemplate)
    let { sortCommentNumberList, sortReplyNumberList, sortEntryCommentList } =
        await getCommentAndReplyData(activityID, studentList, commentTemplate)

    // console.log(sortCommentNumberList, sortReplyNumberList, sortEntryCommentList)
    let studentName = []
    for (let i of studentList) {
        let name = await User.findById(i)
            .select("name")
            .then(e => {
                return e.name
            })
        studentName.push(name)
    }

    let totalCommentNumber = sortCommentNumberList
        .map(e => e.commentSum)
        .reduce(function (prev, cur) {
            return prev + cur
        }, 0)

    let totalReplyNumber = sortReplyNumberList
        .map(e => e.replySum)
        .reduce(function (prev, cur) {
            return prev + cur
        }, 0)

    let totalEntryCommentNumber = sortEntryCommentList.map(e => ({
        entry: e._id,
        commentNumber: e.entryCommentSum,
    }))

    return {
        studentName,
        totalCommentNumber,
        totalReplyNumber,
        totalEntryCommentNumber,
    }
}

async function getMemberDetailOfStudentList(activityID, studentList, commentTemplate) {
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
            ...(await getTotalDataOfStudentList(activityID, [e], commentTemplate)),
        })
    }
    return data
}

//将classData进行个人和小组data的区分
async function getClassData(activityID, authorType, studentList, commentTemplate, courseGroup) {
    return {
        personal: await getPersonalTypeClassData(activityID, studentList, commentTemplate),
        group: await getGroupTypeClassData(activityID, courseGroup, commentTemplate),
    }
}

async function getGroupTypeClassData(activityID, courseGroup, commentTemplate) {
    let data = []
    for (let g of courseGroup) {
        data.push(await getTotalDataOfStudentList(activityID, g.groupMember, commentTemplate))
    }
    //console.log(data[0].dataPersonalOrGroupEntryCommentNumber)
    let mostComment = Math.max(...data.map(e => e.totalCommentNumber))
    let mostReply = Math.max(...data.map(e => e.totalReplyNumber))

    let mostEntryComment = commentTemplate.map(c => ({
        entry: c,
        commentNumber: Math.max(
            ...data.map(
                e => e.totalEntryCommentNumber.find(entry => entry.entry === c).commentNumber || 0
            )
        ),
    }))
    //班级小组分组平均评论数
    let groupNumber = courseGroup.length || 1
    let avgComment = Math.round(
        data
            .map(e => e.totalCommentNumber)
            .reduce(function (prev, cur) {
                return prev + cur
            }, 0) / groupNumber
    )
    //班级小组分组平均回复数
    let avgReply = Math.round(
        data
            .map(e => e.totalReplyNumber)
            .reduce(function (prev, cur) {
                return prev + cur
            }, 0) / groupNumber
    )
    //每条entry的班级小组分组平均回复数
    let avgEntryComment = commentTemplate.map(c => ({
        entry: c,
        commentNumber:
            data
                .map(
                    e =>
                        e.totalEntryCommentNumber.find(entry => entry.entry === c).commentNumber ||
                        0
                )
                .reduce(function (prev, cur) {
                    return prev + cur
                }, 0) / groupNumber,
    }))
    return {
        mostComment,
        mostReply,
        mostEntryComment,
        avgComment,
        avgReply,
        avgEntryComment,
    }
}

async function getPersonalTypeClassData(activityID, studentList, commentTemplate) {
    let { sortCommentNumberList, sortReplyNumberList, sortEntryCommentList } =
        await getCommentAndReplyData(activityID, studentList, commentTemplate)
    //最多评论数

    let mostComment = sortCommentNumberList[0] ? sortCommentNumberList[0].commentSum : 0
    //最多回复数
    let mostReply = sortReplyNumberList[0] ? sortReplyNumberList[0].replySum : 0
    //每条entry最多评论数
    let mostEntryComment = sortEntryCommentList.map(e => ({
        entry: e._id,
        commentNumber: e.entryCommentSum,
    }))
    //学生数
    let numberStudent = studentList.length || 1 //防止没学生时div0
    //班级平均评论数
    let avgComment = Math.round(
        sortCommentNumberList
            .map(e => e.commentSum)
            .reduce(function (prev, cur) {
                return prev + cur
            }, 0) / numberStudent
    )
    //班级平均回复数
    let avgReply = Math.round(
        sortReplyNumberList
            .map(e => e.replySum)
            .reduce(function (prev, cur) {
                return prev + cur
            }, 0) / numberStudent
    )
    //每条entry的班级平均回复数
    let avgEntryComment =
        sortEntryCommentList.map(e => ({
            entry: e._id,
            commentNumber: Math.round(e.entryCommentSum / e.user.length),
        })) || 0

    return {
        mostComment,
        mostReply,
        mostEntryComment,
        avgComment,
        avgReply,
        avgEntryComment,
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
