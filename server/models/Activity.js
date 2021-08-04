import mongoose from "mongoose"

/**
 * @options	:{
 * 				isTimeLimited: Boolean,
                limitTime: array,
                isUseCommentTemplate: boolean,
                commentTemplate: array,
                isNeedApprove: boolean,
                authorType: "personal"||"group",
                evaluation: {
                    phaseSwitchMethod: "auto"||"manual",
                    submitLimitTime: array,
                    evaluationLimitTime: array,
                    discussionLimitTime: array,
                    isDiscussionTimeLimited: boolean,
            },
 * }
 */
var activitySchemas = new mongoose.Schema({
    name: String,
    intro: String,
    type: String,
    options: {},
    sectionID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
    },
    isUsed: {
        type: Boolean,
        default: true,
    },
})

export default mongoose.model("Activity", activitySchemas)
