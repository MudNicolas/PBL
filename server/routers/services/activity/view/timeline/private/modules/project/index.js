import Router from "express"

import timelimit from "./modules/timelimit.js"
import create from "./modules/create.js"
import permission from "../permission.js"
import edit from "./modules/edit.js"
import stage from "./modules/stage.js"

let router = Router()

router.use(timelimit)
router.use("/create", create)
router.use(permission)
router.use("/edit", edit)
router.use("/stage", stage)

export default router
