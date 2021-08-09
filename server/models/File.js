import mongoose from "mongoose"

var fileSchema = new mongoose.Schema({
    originalFilename: String,
    serverFilename: String,
    submitUID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    isSubmitted: {
        type: Boolean,
        default: false,
    },
    size: Number,
    uploadTime: Date,
    isUsed: {
        type: Boolean,
        default: true,
    },
    type: String,
})

export default mongoose.model("File", fileSchema)
