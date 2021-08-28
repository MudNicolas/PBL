import Router from "express"
let router = Router()

import publicRouter from "./public/index.js"
import privateRouter from "./private/index.js"
import teacher from "./teacher/index.js"
import stage from "./stage/index.js"

router.use("/private", privateRouter)
router.use("/public", publicRouter)
router.use("/teacher", teacher)
router.use("/stage", stage)

export default router
