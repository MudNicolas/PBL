import mongoose from "mongoose"

let commentSchemas = new mongoose.Schema({
    activityContentID: {
        type: mongoose.Schema.Types.ObjectId,
    },
    isSubmit: {
        type: Boolean,
        default: false,
    },
    isUsed: {
        type: Boolean,
        default: true,
    },
    commentUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    comment: [
        {
            entry: String,
            content: String,
        },
    ],
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
    time: Date,
    type: String, //private,public
    reply: [
        {
            fromUser: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            toUser: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            toReply: {
                type: mongoose.Schema.Types.ObjectId,
            },
            content: String,
            time: Date,
            isUsed: {
                type: Boolean,
                default: true,
            },
        },
    ],
})

export default mongoose.model("Comment", commentSchemas)
