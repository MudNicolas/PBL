import Router from "express"

import pretreat from "./modules/pretreat.js"
import info from "./modules/info.js"
import content from "./modules/content/index.js"
import del from "./modules/delete.js"
import commentTemplate from "./modules/commentTemplate.js"
import interEvaluationTemplate from "./modules/interEvaluationTemplate.js"

let router = Router()

/**
 * @req.section section
 * @req.course course
 */

router.use(pretreat)
router.use("/info", info)
router.use("/content", content)
router.use("/delete", del)
router.use("/activity/commentTemplate", commentTemplate)
router.use("/activity/interEvaluationTemplate", interEvaluationTemplate)

export default router
