import Router from "express"

import pretreat from "./modules/pretreat.js"
import get from "./modules/get.js"

let router = Router()

//验证此section的course是否具有访问权限
router.use(pretreat)
router.use("/get", get)

export default router
