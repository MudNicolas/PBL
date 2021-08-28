import Router from "express"

var router = Router()

import pretreat from "./modules/pretreat.js"
import info from "./modules/info.js"
import avatar from "./modules/avatar.js"
import password from "./modules/password.js"
import popover from "./modules/profilePopoverInfo.js"

router.use(pretreat)
/**
 * req.targetUser -> target user
 */
router.use("/info", info)
router.use("/avatar", avatar)
router.use("/password", password)
router.use("/profilePopoverInfo", popover)

export default router
