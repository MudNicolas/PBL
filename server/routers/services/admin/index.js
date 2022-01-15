import Router from "express"
import pretreat from "./modules/pretreat.js"
import user from "./user/index.js"

var router = Router()

router.use(pretreat)
router.use("/user", user)

export default router
