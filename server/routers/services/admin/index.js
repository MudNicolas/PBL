import Router from "express"
import pretreat from "./modules/pretreat.js"
import user from "./user/index.js"
import course from "./course/index.js"

var router = Router()

router.use(pretreat)
router.use("/user", user)
router.use("/course", course)

export default router
