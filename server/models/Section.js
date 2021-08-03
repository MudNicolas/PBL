import mongoose from "mongoose"

var sectionSchema = new mongoose.Schema({
    name: String,
    info: String,
    date: Date,
    visible: {
        type: Boolean,
        default: true,
    },
    isUsed: {
        type: Boolean,
        default: true,
    },
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    index: Number,
    files: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
        },
    ],
    urls: [
        {
            name: String,
            url: String,
        },
    ],
    activity: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Activity",
        },
    ],
})

export default mongoose.model("Section", sectionSchema)
