import Router from "express"

import pretreat from "./modules/pretreat.js"
import typeRouter from "./modules/typeRouter.js"
import timeline from "./timeline/index.js"
import evaluation from "./evaluation/index.js"
import comments from "./comment/index.js"

let router = Router()

router.use(pretreat)
router.use("/type", typeRouter)
router.use("/timeline", timeline)
router.use("/comments", comments)
router.use("/evaluation", evaluation)

export default router
