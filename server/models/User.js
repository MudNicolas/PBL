import mongoose from 'mongoose'

var userSchemas = new mongoose.Schema({
    username: String,
    password: String,
    avatar: {
        type: String,
        default: 'default.gif'
    },
    name: String,
    role: Array,
    introduction: {
        type: String
    },
    isUsed: {
        type: Boolean,
        default: true
    }
})

export default mongoose.model('User', userSchemas);