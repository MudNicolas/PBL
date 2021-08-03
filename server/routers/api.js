import Router from "express"

var router = Router()

import pretreat from "#services/pretreat.js"
import user from "#services/user.js"
import theme from "#services/theme.js"
import course from "#services/course.js"
import breadCrumb from "#services/breadCrumb.js"
import section from "#services/section.js"
import files from "#services/files.js"
import activity from "#services/activity.js"

router.use(pretreat)
router.use("/user", user)
router.use("/theme", theme)
router.use("/course", course)
router.use("/activity", activity)
router.use("/breadCrumb", breadCrumb)
router.use("/section", section)
router.use("/files", files)

export default router
