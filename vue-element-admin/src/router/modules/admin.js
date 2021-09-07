export default [
    {
        path: "/admin/administrator",
        name: "ManageAdministrator",
        meta: {
            roles: ["admin"],
        },
    },
    {
        path: "/admin/teacher",
        name: "ManageTeacher",
        meta: {
            roles: ["admin"],
        },
    },
    {
        path: "/admin/student",
        name: "ManageStudent",
        meta: {
            roles: ["admin"],
        },
    },
    {
        path: "/admin/course",
        name: "ManageCourse",
        meta: {
            roles: ["admin"],
        },
        children: [
            {
                path: "index",
                name: "CourseDetail",
            },
            {
                path: "recovery",
                name: "CourseRecovery",
            },
        ],
    },
    {
        path: "/admin/content",
        name: "ManageCourseContent",
        meta: {
            roles: ["admin"],
        },
        children: [
            {
                path: "section/recovery",
                name: "SectionRecovery",
            },
            {
                path: "activity/recovery",
                name: "ActivityRecovery",
            },
        ],
    },
    {
        path: "/admin/space/clear",
        name: "FreeUpSpace",
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
