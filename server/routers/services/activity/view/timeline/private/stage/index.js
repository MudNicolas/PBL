import Router from "express"

import manage from "./manage/index.js"
import get from "./modules/get.js"
import editable from "./modules/editable.js"
import editor from "./modules/editor.js"
import save from "./modules/save.js"
import timelimit from "./modules/timelimit.js"

let router = Router()

router.use("/get", get)
router.use(timelimit)
router.use("/manage", manage)
router.use(editable)
router.use("/editor", editor)
router.use("/save", save)

export default router
