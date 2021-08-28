import Router from "express"

import pretreat from "./modules/pretreat.js"
import info from "./modules/info.js"
import student from "./modules/student.js"
import partner from "./modules/partner.js"
import commontTemplate from "./modules/commentTemplate.js"
import group from "./modules/group.js"

let router = Router()

router.use(pretreat)
router.use("/info", info)
router.use("/student", student)
router.use("/partner", partner)
router.use("/commentTemplate", commontTemplate)
router.use("/group", group)

export default router
