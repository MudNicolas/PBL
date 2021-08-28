import Router from "express"
let router = Router()

import allProject from "./modules/all.js"
import singleProject from "./modules/single.js"
import stage from "./modules/stage.js"

router.use("/all", allProject)
router.use("/single", singleProject)
router.use("/stage", stage)

export default router
