import Router from "express"

import privateRouter from "./modules/private.js"
import approve from "./modules/approve/index.js"

let router = Router()

router.use("/private", privateRouter)
router.use("/approve", approve)

export default router
