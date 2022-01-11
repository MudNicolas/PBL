import mongoose from "mongoose"

export default mongoose.model("EvaluationWork", {
    activityID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
    },
    authorType: String,
    authorID: mongoose.Schema.Types.ObjectId,
    authorUID: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    workName: {
        type: String,
        default: "",
    },
    sketch: String,
    createTime: Date,
    lastSubmitTime: Date,
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
    allUploadedFiles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
        },
    ],
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
})
