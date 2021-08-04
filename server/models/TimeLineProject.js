import mongoose from "mongoose"

//[{timeline@name,@intro,@time,@isUsed,@content}]
var projectSchemas = new mongoose.Schema({
    name: String,
    intro: String,
    time: Date,
    isUsed: {
        type: Boolean,
        default: true,
    },
    authorType: String,
    authorID: mongoose.Schema.Types.ObjectId,
    timeline: [
        {
            authorUID: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
            content: String,
            isUsed: {
                type: Boolean,
                default: true,
            },
            editLog: {
                uid: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                time: Date,
            },
            //手动保存一次，才正式在时间线上显示
            isManualSave: {
                type: Boolean,
                default: false,
            },
        },
    ],
})

export default mongoose.model("TimeLineProject", projectSchemas)
