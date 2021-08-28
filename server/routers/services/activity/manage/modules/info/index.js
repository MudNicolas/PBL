import Router from "express"

import get from "./modules/get.js"
import submit from "./modules/submit.js"

let router = Router()

router.use("/get", get)
router.use("/submit", submit)

export default router
