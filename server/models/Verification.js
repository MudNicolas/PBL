import mongoose from "mongoose"

var verificationSchemas = new mongoose.Schema({
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    loginTime: Date,
    role: String,
    latestOperationTime: Date,
    logout: {
        type: Boolean,
        default: false,
    },
    dangerousOperationVerificateTime: Date,
})

export default mongoose.model("Verification", verificationSchemas)
