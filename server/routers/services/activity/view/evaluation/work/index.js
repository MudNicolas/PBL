import Router from "express"
import my from "./my/index.js"
import others from "./others/index.js"

let router = Router()

router.use("/my", my)
router.use("/others", others)

export default router
