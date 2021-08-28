import Router from "express"

import pretreat from "./modules/pretreat.js"
import info from "./modules/info.js"
import content from "./modules/content/index.js"
import del from "./modules/delete.js"
import template from "./modules/commentTemplate.js"

let router = Router()

/**
 * @req.section section
 * @req.course course
 */

router.use(pretreat)
router.use("/info", info)
router.use("/content", content)
router.use("/delete", del)
router.use("/activity/commentTemplate", template)

export default router
