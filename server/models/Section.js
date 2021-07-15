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
})

export default mongoose.model("Section", sectionSchema)
