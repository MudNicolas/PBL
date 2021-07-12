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
		name: String,
		groupMember: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}],
		isUsed: {
			type: Boolean,
			default: true
		}
	}],
	isUsed: {
		type: Boolean,
		default: true
	},
	date: Date,
	commentTemplate: [{
		name: String,
		template: Array,
		isUsed: {
			type: Boolean,
			default: true
		}
	}]
})

export default mongoose.model('Course', courseSchema);
