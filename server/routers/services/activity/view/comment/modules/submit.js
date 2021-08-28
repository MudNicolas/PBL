import Router from "express"
let router = Router()

import { processContentSource } from "#services/tools/index.js"

router.post("/", (req, res) => {
    let { comments } = req.body
    let { commentData } = req
    let contents = ""
    for (let c of comments) {
        let { entry, content } = c
        let index = commentData.comment.findIndex(e => e.entry === entry)
        if (index > -1) {
            commentData.comment[index].content = content
        } else {
            commentData.comment.push(c)
        }
        contents += content
    }
    commentData.commentUserRole = req.role
    commentData.isSubmit = true
    commentData.time = new Date()
    processContentSource(commentData, contents)
        .then(d => {
            let { imagesID, videosID } = d
            commentData.images = imagesID
            commentData.videos = videosID
            commentData.save(err => {
                if (err) {
                    return
                }
                res.json({
                    code: 20000,
                })
            })
        })
        .catch(err => {
            console.log(err)
            res.json(err)
        })
})

export default router
