import mongoose from 'mongoose'

var themeSchemas = new mongoose.Schema({
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    theme: String,
    tagsView: Boolean,
    fixedHeader: Boolean
})

export default mongoose.model('Theme', themeSchemas);