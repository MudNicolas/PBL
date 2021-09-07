import Router from "express"
let router = Router()

import publicRouter from "./public/index.js"
import privateRouter from "./private/index.js"
import teacher from "./teacher/index.js"

router.use("/private", privateRouter)
router.use("/public", publicRouter)
router.use("/teacher", teacher)

export default router
