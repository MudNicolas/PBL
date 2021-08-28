import Router from "express"

import pretreat from "./modules/pretreat.js"
import get from "./modules/get.js"
import timelimit from "./modules/timelimit.js"
import project from "./modules/project.js"

let router = Router()

router.use(pretreat)
router.use("/get", get)
router.use(timelimit)
router.use("/project", project)

export default router
