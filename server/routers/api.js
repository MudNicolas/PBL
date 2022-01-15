import Router from "express"

var router = Router()

import pretreat from "#services/pretreat/index.js"
import user from "#services/user/index.js"
import theme from "#services/theme/index.js"
import course from "#services/course/index.js"
import breadCrumb from "#services/breadCrumb/index.js"
import section from "#services/section/index.js"
import files from "#services/files/index.js"
import activity from "#services/activity/index.js"
import admin from "#services/admin/index.js"

router.use(pretreat)
router.use("/user", user)
router.use("/theme", theme)
router.use("/course", course)
router.use("/activity", activity)
router.use("/breadCrumb", breadCrumb)
router.use("/section", section)
router.use("/files", files)
router.use("/admin", admin)

export default router
