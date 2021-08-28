import Router from "express"

import pretreat from "./modules/pretreat.js"
import get from "./modules/get.js"

var router = Router()

router.use(pretreat)
router.use("/get", get)

export default router
