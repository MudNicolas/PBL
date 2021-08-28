import Router from "express"

import view from "./view/index.js"
import manage from "./manage/index.js"
import pretreat from "./modules/pretreat.js"
import create from "./modules/create.js"

let router = Router()

router.use("/view", view)
router.use("/manage", manage)

//验证此section的course是否具有访问权限(无activityID时)
router.use(pretreat)
router.use("/create", create)

export default router
