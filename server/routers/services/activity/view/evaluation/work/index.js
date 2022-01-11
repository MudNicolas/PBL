import Router from "express"
import my from "./my/index.js"

let router = Router()

router.use("/my", my)

export default router
