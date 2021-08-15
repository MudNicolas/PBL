import mongoose from "mongoose"

export default mongoose.model(
    "EditorVideo",
    new mongoose.Schema({
        serverFilename: String,
        submitUID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        uploadTime: Date,
        isUsed: {
            type: Boolean,
            default: true,
        },
        isNeeded: {
            type: Boolean,
            default: true,
        },
        type: String,
        sectionID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
        },
        courseID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    })
)
