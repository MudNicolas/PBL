import Router from "express"
let router = Router()

import getComments from "./modules/get.js"
import access from "./modules/access.js"
import reply from "./modules/reply.js"
import ownPermission from "./modules/ownPermission.js"
import editor from "./modules/editor.js"
import removePermission from "./modules/removePermission.js"
import remove from "./modules/remove.js"
import submit from "./modules/submit.js"

router.use("/get", getComments)
//验证comment是否存在
router.use(access)
router.use("/reply", reply)
router.use(removePermission)
router.use("/remove", remove)
router.use(ownPermission)
router.use("/editor", editor)
router.use("/submit", submit)

export default router
