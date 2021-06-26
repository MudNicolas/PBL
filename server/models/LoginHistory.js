import mongoose from 'mongoose'

var loginHistorySchemas = new mongoose.Schema({
	uid: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	loginTime: Date,
	role: String,
	latestOperationTime: Date,
	logout: {
		type: Boolean,
		default: false
	}
})

export default mongoose.model('LoginHistory', loginHistorySchemas);
