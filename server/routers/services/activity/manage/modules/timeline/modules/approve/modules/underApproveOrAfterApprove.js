import Router from "express"

let router = Router()

router.use((req, res, next) => {
    let { stage } = req
    if (
        ![
            "underApprove",
            "approved",
            "rejected",
            "underConcludeApprove",
            "conclude",
            "concludeRejected",
        ].includes(stage.status)
    ) {
        res.json({
            code: 404,
        })
        return
    }
    next()
})

export default router
