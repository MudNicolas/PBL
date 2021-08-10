import mongoose from "mongoose"

export default mongoose.model(
    "EditorImage",
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
        type: String,
    })
)
