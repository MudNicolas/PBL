import Layout from "@/layout"

export default [
    {
        path: "/admin/manage/user",
        component: Layout,
        redirect: "noRedirect",
        alwaysShow: true, //一直显示根路由
        name: "UserManager",
        meta: {
            icon: "el-icon-user-solid",
            roles: ["admin", "root"],
            title: "用户管理",
        },
        children: [
            {
                path: "teacher",
                name: "TeacherManager",
                component: () => import("@/views/admin/user-manager/teacher"),
                meta: {
                    roles: ["admin", "root"],
                    title: "教师管理",
                },
            },
            {
                path: "student",
                name: "StudentManager",
                component: () => import("@/views/admin/user-manager/student"),

                meta: {
                    roles: ["admin"],
                    title: "学生管理",
                },
            },
            {
                path: "administrator",
                name: "AdminManager",
                meta: {
                    roles: ["root"],
                    title: "管理员管理",
                },
            },
        ],
    },

    {
        path: "/admin/course",
        name: "CourseManager",
        component: Layout,
        meta: {
            icon: "el-icon-s-data",
            roles: ["admin"],
            title: "课程管理",
        },
    },

    {
        path: "/admin/space/clear",
        name: "FreeUpSpace",
        hidden: true,
        meta: {
            roles: ["admin"],
        },
        children: [
            {
                path: "file",
                name: "ClearFile",
            },
            {
                path: "editor",
                name: "ClearEditorSource",
            },
        ],
    },
]
