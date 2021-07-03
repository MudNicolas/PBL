import mongoose from 'mongoose'

var courseSchema = new mongoose.Schema({
	name: String,
	introduction: {
		type: String,
		default: "暂无简介"
	},
	cover: String,
	studentList: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}],
	chiefTeacher: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	partnerTeacher: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}],
	sectionIDs: [{
		//
	}],
	group: [{
		groupMember: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}]
	}],
	isUsed: {
		type: Boolean,
		default: true
	},
	date: Date,
	commentTemplate: [{
		name: String,
		template: [{
			entry: String,
		}]
	}]
})

export default mongoose.model('Course', courseSchema);
