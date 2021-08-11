import mongoose from "mongoose"

export default mongoose.model("Stage", {
    timelineProjectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TimeLineProject",
    },
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
    isPublic: {
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
    editable: {
        type: Boolean,
        default: true,
    },
})
