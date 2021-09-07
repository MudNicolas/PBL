import Router from "express"

import pretreat from "./modules/pretreat.js"
import get from "./modules/get.js"
import project from "./modules/project/index.js"
import stage from "./stage/index.js"

let router = Router()

router.use(pretreat)
router.use("/get", get)
router.use("/project", project)
router.use("/stage", stage)

export default router
