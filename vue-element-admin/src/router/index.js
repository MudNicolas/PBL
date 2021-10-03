import Vue from "vue"
import Router from "vue-router"

Vue.use(Router)

/* Layout */
import Layout from "@/layout"

//import adminRouter from "./modules/admin"

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
	roles: ['admin','editor']    control the page roles (you can set multiple roles)
	title: 'title'               the name show in sidebar and breadcrumb (recommend set)
	icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
	noCache: true                if set true, the page will no be cached(default is false)
	affix: true                  if set true, the tag will affix in the tags-view
	breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
	activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
    {
        path: "/redirect",
        component: Layout,
        hidden: true,
        children: [
            {
                path: "/redirect/:path(.*)",
                component: () => import("@/views/redirect/index"),
            },
        ],
    },
    {
        path: "/login",
        component: () => import("@/views/login/index"),
        hidden: true,
    },
    {
        path: "/auth-redirect",
        component: () => import("@/views/login/auth-redirect"),
        hidden: true,
    },
    {
        path: "/404",
        component: () => import("@/views/error-page/404"),
        hidden: true,
    },
    {
        path: "/401",
        component: () => import("@/views/error-page/401"),
        hidden: true,
    },
    {
        path: "/",
        component: Layout,
        redirect: "/",
        children: [
            {
                path: "",
                component: () => import("@/views/home/index"),
                name: "Home",
                meta: { title: "首页", icon: "el-icon-s-home", affix: true },
            },
        ],
    },
    {
        path: "/profile",
        redirect: "/profile/index",
        component: Layout,
        hidden: true,
        children: [
            {
                path: "index",
                component: () => import("@/views/profile/index"),
                name: "Profile",
                meta: { title: "个人信息", icon: "user" },
            },
        ],
    },
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
    //adminRouter,

    {
        path: "/course",
        component: Layout,
        redirect: "noRedirect",
        alwaysShow: true, //一直显示根路由
        name: "Course",
        meta: {
            icon: "el-icon-s-data",
            title: "我的课程",
        },
        children: [
            {
                path: "create",
                component: () => import("@/views/course/create/index"),
                name: "CreateCourse",
                meta: {
                    roles: ["teacher"],
                    icon: "el-icon-plus",
                    title: "新建课程",
                },
            },
            {
                path: "view/:id([a-f0-9]{24})",
                hidden: true,
                component: () => import("@/views/course/view/index"),
                name: "CourseView",
                meta: {
                    roles: ["teacher", "student"],
                },
            },
            {
                path: "manage/:id([a-f0-9]{24})",
                component: () => import("@/views/course/manage/index"),
                name: "ManageCourse",
                hidden: true,
                meta: {
                    roles: ["teacher"],
                },
            },

            {
                path: "section/view/:id([a-f0-9]{24})",
                component: () => import("@/views/section"),
                name: "SectionView",
                hidden: true,
                meta: {
                    roles: ["teacher", "student"],
                },
            },
            {
                path: "section/activity/create/:id([a-f0-9]{24})",
                component: () =>
                    import("@/views/section/components/comtentManage/components/newActivity"),
                name: "CreateActivity",
                hidden: true,
                meta: {
                    roles: ["teacher", "student"],
                },
            },
            {
                path: "section/activity/view/:id([a-f0-9]{24})",
                component: () => import("@/views/activity"),
                name: "ActivityView",
                hidden: true,
                meta: {
                    roles: ["teacher", "student"],
                },
            },
            {
                path: "section/activity/manage/:id([a-f0-9]{24})",
                component: () => import("@/views/activityManage"),
                name: "ActivityManage",
                hidden: true,
                meta: {
                    roles: ["teacher"],
                },
            },
            {
                path: "section/activity/timelineProject/stage/approve/:id([a-f0-9]{24})",
                component: () => import("@/views/approve"),
                name: "Approve",
                hidden: true,
                meta: {
                    roles: ["teacher"],
                },
            },
            {
                path: "section/activity/timeline/overview/private/view/:id([a-f0-9]{24})",
                component: () =>
                    import(
                        "@/views/activity/components/timeline-project/components/private-space/index"
                    ),
                name: "TeacherViewPrivateTimeline",
                hidden: true,
                meta: {
                    roles: ["teacher"],
                },
            },
            {
                path:
                    "section/activity/timeline/private/stage/overview/private/view/:id([a-f0-9]{24})",
                component: () => import("@/views/stage/private/index"),
                name: "TeacherViewPrivateStage",
                hidden: true,
                meta: {
                    roles: ["teacher"],
                },
            },
        ],
    },
    {
        path: "/course/section/activity/timeline/private",
        name: "PrivateSpace",
        component: Layout,
        hidden: true,
        meta: {
            roles: ["student"],
            title: "私有空间",
        },
        children: [
            {
                path: "stage/view/:id([a-f0-9]{24})",
                component: () => import("@/views/stage/private/index"),
                name: "TimeLineStage",
            },
            {
                path: "stage/manage/:id([a-f0-9]{24})",
                component: () => import("@/views/stage/private/manage"),
                name: "StageManage",
            },
        ],
    },
    {
        path: "/course/section/activity/timeline/public",
        name: "PublicSpace",
        component: Layout,
        hidden: true,
        meta: {
            roles: ["teacher", "student"],
            title: "公共空间",
        },
        children: [
            {
                path: "view/:id([a-f0-9]{24})",
                component: () =>
                    import(
                        "@/views/activity/components/timeline-project/components/public-space/publicWorkSpace"
                    ),
                name: "PublicTimelineProjectView",
            },
            {
                path: "stage/view/:id([a-f0-9]{24})",
                component: () => import("@/views/stage/public/index"),
                name: "PublicTimelineStage",
            },
        ],
    },
    {
        path: "/verificate",
        hidden: true,
        name: "Verificate",
        meta: {
            title: "身份验证",
        },
        component: () => import("@/views/verificate"),
    },

    // 404 page must be placed at the end !!!
    { path: "*", redirect: "/404", hidden: true },
]

const createRouter = () =>
    new Router({
        mode: "history", // require service support
        // scrollBehavior: () => ({ y: 0 }),
        routes: constantRoutes,
    })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
    const newRouter = createRouter()
    router.matcher = newRouter.matcher // reset router
}

export default router
