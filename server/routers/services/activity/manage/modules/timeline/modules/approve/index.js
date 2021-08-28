import Router from "express"

import getAll from "./modules/allProjects.js"
import checkUnderApproveOrAfterApprove from "./modules/underApproveOrAfterApprove.js"
import singleProjectHandler from "./modules/singleProject.js"

let router = Router()

router.use("/all", getAll)
router.use(checkUnderApproveOrAfterApprove)
router.use("/single", singleProjectHandler)

export default router
