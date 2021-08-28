import Router from "express"

import sectionView from "./view/index.js"
import manage from "./manage/index.js"
import pretreat from "./modules/pretreat.js"
import create from "./modules/create.js"
import sort from "./modules/sort.js"

let router = Router()

router.use("/view", sectionView)

//教师api
//确定section的Api
router.use("/manage", manage)

//给多个sectin和无sectionID情况下的api
router.use(pretreat)
router.use("/create", create)
router.use("/sort", sort)

export default router
