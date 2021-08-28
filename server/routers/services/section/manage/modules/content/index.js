import Router from "express"

import get from "./modules/get.js"
import link from "./modules/link.js"
import file from "./modules/file.js"

let router = Router()

router.use("/get", get)
router.use("/link", link)
router.use("/file", file)

export default router
