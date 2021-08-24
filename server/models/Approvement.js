import mongoose from "mongoose"

export default mongoose.model(
    "Approvement",
    new mongoose.Schema({
        timeLineProjectID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TimeLineProject",
        },
        stageID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Stage",
        },
        time: Date,
        approver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        status: String,
        reason: String,
    })
)
