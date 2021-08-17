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

router.post("/info/save", (req, res) => {
    let { stage } = req
    let { subjectName, sketch } = req.body
    stage.subjectName = subjectName
    stage.sketch = sketch
    stage.save(err => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error",
            })
            return
        }
        res.json({
            code: 20000,
        })
    })
})

router.get("/editLog/get", (req, res) => {
    let { stage } = req
    stage
        .execPopulate({
            path: "editLog.uid",
            select: "name",
        })
        .then(_stage => {
            let { editLog } = _stage
            res.json({
                code: 20000,
                data: editLog,
            })
        })
})

export default router
