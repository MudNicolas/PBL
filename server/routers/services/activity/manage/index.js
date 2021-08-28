import Router from "express"

import pretreat from "./modules/pretreat.js"
import Type from "./modules/type.js"
import info from "./modules/info/index.js"
import remove from "./modules/remove.js"
import timeline from "./modules/timeline/index.js"

let router = Router()

/**
 * role teacher
 */
router.use(pretreat)

router.use("/type", Type)
router.use("/info", info)
router.use("/remove", remove)
router.use("/timelineProject", timeline)

export default router
