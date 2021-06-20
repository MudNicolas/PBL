import mongoose from 'mongoose'

var loginHistorySchemas = new mongoose.Schema({
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    loginTime: Date,
    role: String
})

export default mongoose.model('LoginHistory', loginHistorySchemas);