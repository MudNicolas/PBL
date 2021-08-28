import Router from "express"

import login from "./modules/login.js"
import auth from "./modules/auth.js"
import logout from "./modules/logout.js"
import del from "./modules/delete.js"

var router = Router()

router.use("/login", login)
router.use(auth)
router.use("/logout", logout)
router.use(del)

export default router
