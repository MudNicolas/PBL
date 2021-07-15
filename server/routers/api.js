import Router from "express"

var router = Router()

import pretreat from "#services/pretreat.js"
import user from "#services/user.js"
import theme from "#services/theme.js"
import course from "#services/course.js"
import view from "#services/view.js"
import breadCrumb from "#services/breadCrumb.js"
import section from "#services/section.js"

router.use(pretreat)
router.use("/user", user)
router.use("/theme", theme)
router.use("/course", course)
router.use("/view", view)
router.use("/breadCrumb", breadCrumb)
router.use("/section", section)

export default router
