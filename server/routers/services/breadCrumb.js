import Router from "express"
var router = Router()
import Course from "#models/Course.js"
import Section from "#models/Section.js"

class routeTree {
    tree = {
        Home: {
            path: "/",
            redirect: "/",
            parent: "Null",
            meta: { title: "首页" },
        },
        Course: {
            path: "/course",
            parent: "Home",
            redirect: "noRedirect",
            meta: { title: "我的课程" },
        },
        CourseView: {
            path: "/course/view/",
            parent: "Course",
            meta: {
                title: async function (id) {
                    if (/^[a-fA-F0-9]{24}$/.test(id)) {
                        let title = await Course.findById(id)
                            .select("name")
                            .then(e => {
                                //console.log(e)
                                return e
                            })
                        return title
                    }
                },
            },
        },
        ManageCourse: {
            path: "/course/manage",
            parent: "CourseView",
            meta: { title: "管理" },
        },
        Profile: {
            path: "/profile",
            parent: "Home",
            meta: {
                title: "个人信息",
            },
        },
        CreateCourse: {
            path: "/course/create",
            parent: "Course",
            meta: {
                title: "创建课程",
            },
        },
        CreateSection: {
            path: "/course/section/create",
            parent: "CourseView",
            meta: { title: "新建节" },
        },
        SectionView: {
            path: "/course/section/view/",
            parent: "CourseView",
            meta: {
                title: async function (id) {
                    if (/^[a-fA-F0-9]{24}$/.test(id)) {
                        let title = await Section.findById(id)
                            .select("name courseID")
                            .then(e => {
                                //console.log(e)
                                return {
                                    name: e.name,
                                    parentID: e.courseID,
                                }
                            })
                        return title
                    }
                },
            },
        },
        CreateActivity: {
            path: "/course/section/activity/create",
            parent: "SectionView",
            meta: {
                title: "创建活动",
            },
        },
    }

    get(name) {
        return this.tree[name]
    }
}

async function generateBreadCrumb(name, id) {
    let tree = new routeTree()
    let p = name
    let gen = []
    while (p != "Null") {
        let t = tree.get(p)
        if (t) {
            gen.push(t)
            p = t.parent
        } else {
            p = "Home"
        }
    }
    //parentID不断传递更新
    let fid = id
    for (let f of gen) {
        if (f.meta && f.meta.title && typeof f.meta.title === "function") {
            f.path += fid
            let func = f.meta.title
            let funcTitle = await func(fid)
            if (funcTitle && funcTitle.name) {
                f.meta.title = funcTitle.name
                if (funcTitle.parentID) {
                    fid = funcTitle.parentID
                }
            }
        }
    }
    gen.reverse()
    return gen
}

router.get("/get", async (req, res, next) => {
    let _id = req.query._id
    let name = req.query.name
    //console.log(params)
    let breadCrumb = []

    breadCrumb = await generateBreadCrumb(name, _id)

    //console.log(breadCrumb)
    res.json({
        code: 20000,
        data: {
            breadCrumb: breadCrumb,
        },
    })
})

export default router
