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
            status: String, //approve,normal,conclude,rejected,abandoned 审批阶段，正式阶段,结题，驳回，废弃
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
                },
            ],
        },
    ],
})

export default mongoose.model("TimeLineProject", projectSchemas)
