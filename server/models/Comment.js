import mongoose from "mongoose"

let commentSchemas = new mongoose.Schema({
    contentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ActivityContent",
    },
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
