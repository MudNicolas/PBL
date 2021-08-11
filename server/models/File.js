import mongoose from "mongoose"

var fileSchema = new mongoose.Schema({
    originalFilename: String,
    serverFilename: String,
    submitUID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    size: Number,
    uploadTime: Date,
    isNeeded: {
        type: Boolean,
        default: false,
    },
    isUsed: {
        type: Boolean,
        default: true,
    },
    type: String,
})

export default mongoose.model("File", fileSchema)
