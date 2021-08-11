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
})

export default mongoose.model("TimeLineProject", projectSchemas)
