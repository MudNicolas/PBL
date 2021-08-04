import mongoose from "mongoose"

let commentSchemas = new mongoose.Schema({
    activityContentID: {
        type: mongoose.Schema.Types.ObjectId,
    },
    comment: [
        {
            entry: String,
            content: String,
        },
    ],
    time: Date,
    type: String, //private,public
    reply: [
        {
            from: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            to: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            content: String,
            time: Date,
        },
    ],
})

export default mongoose.model("Comment", commentSchemas)
