import mongoose from "mongoose"

let contentSchemas = new mongoose.Schema({
    AuthorID: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    content: {
        /**
         * timeline 	->	[{timeline@name,@intro,@time,@isUsed,@content}]
         * forum		->	{forum@topic,@info,@time,@isUsed}
         * evaluation	->	{work@name,@intro,@time,@file}
         * work			->	{work@name,@intro,@time,@file}
         */
    },
})

export default mongoose.model("ActivityContent", contentSchemas)
