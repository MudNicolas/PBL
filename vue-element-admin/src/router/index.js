import Vue from "vue"
import Router from "vue-router"

Vue.use(Router)

/* Layout */
import Layout from "@/layout"

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
    {
        path: "/permission",
        component: Layout,
        redirect: "/permission/page",
        hidden: true,
        alwaysShow: true, // will always show the root menu
        name: "Permission",
        meta: {
            title: "Permission",
            icon: "lock",
            roles: ["admin", "editor"], // you can set roles in root nav
        },
        children: [
            {
                path: "page",
                component: () => import("@/views/permission/page"),
                name: "PagePermission",
                meta: {
                    title: "Page Permission",
                    roles: ["admin"], // or you can only set roles in sub nav
                },
            },
            {
                path: "directive",
                component: () => import("@/views/permission/directive"),
                name: "DirectivePermission",
                meta: {
                    title: "Directive Permission",
                    // if do not set roles, means: this page does not require permission
                },
            },
            {
                path: "role",
                component: () => import("@/views/permission/role"),
                name: "RolePermission",
                meta: {
                    title: "Role Permission",
                    roles: ["admin"],
                },
            },
        ],
    },

    {
        path: "/icon",
        component: Layout,
        hidden: true,
        children: [
            {
                path: "index",
                component: () => import("@/views/icons/index"),
                name: "Icons",
                meta: { title: "Icons", icon: "icon", noCache: true },
            },
        ],
    },
    {
        path: "/course",
        component: Layout,
        redirect: "noRedirect",
        alwaysShow: true, //一直显示根路由
        name: "Course",
        meta: {
            title: "我的课程",
            icon: "el-icon-s-data",
        },
        children: [
            {
                path: "create",
                component: () => import("@/views/course/create/index"),
                name: "CreateCourse",
                meta: {
                    title: "创建课程",
                    roles: ["teacher"],
                    icon: "el-icon-plus",
                },
            },
            {
                path: "view/:id([a-f0-9]{24})",
                hidden: true,
                component: () => import("@/views/course/view/index"),
                name: "CourseView",
                meta: {
                    title: "课程",
                    roles: ["teacher", "student"],
                },
            },
            {
                path: "manage/:id([a-f0-9]{24})",
                component: () => import("@/views/course/manage/index"),
                name: "ManageCourse",
                hidden: true,
                meta: {
                    title: "管理",
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
                path: "section/activity/manage/timeline/private/:id([a-f0-9]{24})",
                component: () =>
                    import(
                        "@/views/activity/components/timeline-project/components/teacher-view/index"
                    ),
                name: "TeacherViewPrivateTimeline",
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
            roles: ["teacher", "student"],
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

    {
        path: "/tab",
        component: Layout,
        hidden: true,
        children: [
            {
                path: "index",
                component: () => import("@/views/tab/index"),
                name: "Tab",
                meta: { title: "Tab", icon: "tab" },
            },
        ],
    },

    {
        path: "/error",
        component: Layout,
        hidden: true,
        redirect: "noRedirect",
        name: "ErrorPages",
        meta: {
            title: "Error Pages",
            icon: "404",
        },
        children: [
            {
                path: "401",
                component: () => import("@/views/error-page/401"),
                name: "Page401",
                meta: { title: "401", noCache: true },
            },
            {
                path: "404",
                component: () => import("@/views/error-page/404"),
                name: "Page404",
                meta: { title: "404", noCache: true },
            },
        ],
    },

    {
        path: "/excel",
        component: Layout,
        hidden: true,
        redirect: "/excel/export-excel",
        name: "Excel",
        meta: {
            title: "Excel",
            icon: "excel",
        },
        children: [
            {
                path: "export-excel",
                component: () => import("@/views/excel/export-excel"),
                name: "ExportExcel",
                meta: { title: "Export Excel" },
            },
            {
                path: "export-selected-excel",
                component: () => import("@/views/excel/select-excel"),
                name: "SelectExcel",
                meta: { title: "Export Selected" },
            },
            {
                path: "export-merge-header",
                component: () => import("@/views/excel/merge-header"),
                name: "MergeHeader",
                meta: { title: "Merge Header" },
            },
            {
                path: "upload-excel",
                component: () => import("@/views/excel/upload-excel"),
                name: "UploadExcel",
                meta: { title: "Upload Excel" },
            },
        ],
    },

    {
        path: "/zip",
        component: Layout,
        hidden: true,
        redirect: "/zip/download",
        alwaysShow: true,
        name: "Zip",
        meta: { title: "Zip", icon: "zip" },
        children: [
            {
                path: "download",
                component: () => import("@/views/zip/index"),
                name: "ExportZip",
                meta: { title: "Export Zip" },
            },
        ],
    },

    {
        path: "/pdf",
        component: Layout,
        hidden: true,
        redirect: "/pdf/index",
        children: [
            {
                path: "index",
                component: () => import("@/views/pdf/index"),
                name: "PDF",
                meta: { title: "PDF", icon: "pdf" },
            },
        ],
    },
    {
        path: "/pdf/download",
        hidden: true,
        component: () => import("@/views/pdf/download"),
        hidden: true,
    },

    {
        path: "/clipboard",
        hidden: true,
        component: Layout,
        children: [
            {
                path: "index",
                component: () => import("@/views/clipboard/index"),
                name: "ClipboardDemo",
                meta: { title: "Clipboard", icon: "clipboard" },
            },
        ],
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
