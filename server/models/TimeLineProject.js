import mongoose from "mongoose"

//[{timeline@name,@intro,@time,@isUsed,@content}]
var projectSchemas = new mongoose.Schema({
    activityID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
    },
    name: String,
    intro: String,
    time: Date,
    isUsed: {
        type: Boolean,
        default: true,
    },
    status: String, //approve,normal。审批阶段，正式阶段
    authorType: String,
    authorID: mongoose.Schema.Types.ObjectId,
    stages: [
        {
            authorUID: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
            subjectName: String,
            sketch: String,
            createTime: Date,
            content: String,
            images: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "EditorImage",
                },
            ],
            allUploadedImages: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "EditorImage",
                },
            ],
            videos: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "EditorVideo",
                },
            ],
            allUploadedVideos: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "EditorVideo",
                },
            ],
            files: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "File",
                },
            ],
            allUploadedfiles: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "File",
                },
            ],
            public: {
                type: Boolean,
                default: false,
            },
            status: String, //approvePending待审批,underApprove审批中,normal,conclude,rejected,abandoned 正式阶段,结题，驳回，废弃
            isUsed: {
                type: Boolean,
                default: true,
            },
            editLog: [
                {
                    uid: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                    time: Date,
                    operation: String,
                },
            ],
        },
    ],
})

export default mongoose.model("TimeLineProject", projectSchemas)
