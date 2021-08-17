import Router from "express"
let router = Router()

router.get("/info/get", (req, res) => {
    let { stage } = req

    stage.execPopulate([{ path: "authorUID", select: "name avatar" }]).then(_stage => {
        let { authorUID, isUsed, isPublic, sketch, status, subjectName, _id } = _stage
        let data = {
            authorUID,
            isUsed,
            isPublic,
            sketch,
            status,
            subjectName,
            _id,
        }

        res.json({
            code: 20000,
            data,
        })
    })
})

export default router
