import Router from "express"
let router = Router()

import teacher from "./teacher/index.js"
import work from "./work/index.js"

router.use("/teacher", teacher)
router.use("/work", work)

export default router
