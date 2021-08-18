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
    subjectName: {
        type: String,
        default: "",
    },
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
    allUploadedFiles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
        },
    ],
    isPublic: {
        type: Boolean,
        default: false,
    },
    status: String, //beforeApprove审批前,underApprove审批中,normal,conclude,rejected,abandoned 正式阶段,结题，驳回，废弃

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
    isSaved: {
        type: Boolean,
        default: false,
    },
})
