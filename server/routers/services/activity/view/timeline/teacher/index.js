import Router from "express"

let router = Router()

import permission from "./modules/permission.js"
import allProject from "./modules/all.js"
import manage from "./modules/manage.js"

router.use(permission)
router.use("/all", allProject)
router.use("/manage", manage)

export default router
