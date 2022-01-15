import Course from "#models/Course.js"
import Section from "#models/Section.js"
import Activity from "#root/models/Activity.js"
import TimeLineProject from "#models/TimeLineProject.js"
import Stage from "#models/Stage.js"
import EvaluationWork from "#models/EvaluationWork.js"

export default class {
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
                                if (e) {
                                    return e
                                }
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
                                if (e) {
                                    return {
                                        name: e.name,
                                        parentID: e.courseID,
                                    }
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
        ActivityView: {
            path: "/course/section/activity/view/",
            parent: "SectionView",
            name: "ActivityView",
            meta: {
                title: async function (id) {
                    if (/^[a-fA-F0-9]{24}$/.test(id)) {
                        let title = await Activity.findById(id)
                            .select("name sectionID")
                            .then(e => {
                                if (e) {
                                    return {
                                        name: e.name,
                                        parentID: e.sectionID,
                                    }
                                }
                            })
                        return title
                    }
                },
            },
        },
        PrivateSpace: {
            path: id => {
                return {
                    path: `/course/section/activity/view/${id}`,
                    query: { tab: "privateSpace" },
                }
            },
            parent: "ActivityView",
            meta: {
                title: "私有空间",
            },
        },
        PublicSpace: {
            path: id => {
                return {
                    path: `/course/section/activity/view/${id}`,
                    query: { tab: "publicSpace" },
                }
            },
            parent: "ActivityView",
            meta: {
                title: "公共空间",
            },
        },
        PublicTimelineProjectView: {
            path: "/course/section/activity/timeline/public/view/",
            parent: "PublicSpace",
            meta: {
                title: async id => {
                    if (/^[a-fA-F0-9]{24}$/.test(id)) {
                        return await TimeLineProject.findById(id)
                            .select("activityID name")
                            .populate("timelineProjectID")
                            .then(project => {
                                if (project) {
                                    return {
                                        name: project.name || "暂无阶段名",
                                        parentID: project.activityID,
                                    }
                                }
                            })
                    }
                },
            },
        },
        PublicTimelineStage: {
            path: "/course/section/activity/timeline/public/stage/view/",
            parent: "PublicTimelineProjectView",
            meta: {
                title: async id => {
                    if (/^[a-fA-F0-9]{24}$/.test(id)) {
                        return await Stage.findById(id)
                            .select("timelineProjectID subjectName")
                            .then(project => {
                                if (project) {
                                    return {
                                        name: project.subjectName || "暂无阶段名",
                                        parentID: project.timelineProjectID,
                                    }
                                }
                            })
                    }
                },
            },
        },
        TimeLineStage: {
            path: "/course/section/activity/timeline/private/stage/view/",
            parent: "PrivateSpace",
            meta: {
                title: async id => {
                    if (/^[a-fA-F0-9]{24}$/.test(id)) {
                        return await Stage.findById(id)
                            .select("timelineProjectID subjectName")
                            .populate("timelineProjectID")
                            .then(project => {
                                if (project) {
                                    return {
                                        name: project.subjectName || "暂无阶段名",
                                        parentID: project.timelineProjectID.activityID,
                                    }
                                }
                            })
                    }
                },
            },
        },
        StageManage: {
            path: "/course/section/activity/timeline/private/manage/",
            parent: "TimeLineStage",
            meta: {
                title: "管理",
            },
        },
        ActivityManage: {
            name: "ActivityManage",
            path: "/course/section/activity/manage/",
            parent: "ActivityView",
            meta: {
                title: "管理",
            },
        },
        ApproveNoDirect: {
            path: "*",
            parent: "ActivityManage",
            redirect: "noRedirect",
            meta: { title: "项目审批" },
        },
        Approve: {
            path: "/course/section/activity/timelineProject/stage/approve/",
            parent: "ApproveNoDirect",
            parentQuery: {
                type: "TimeLineProject",
                tab: "approve",
            },
            queryParentName: "ActivityManage",
            meta: {
                title: async id => {
                    if (/^[a-fA-F0-9]{24}$/.test(id)) {
                        return await Stage.findById(id)
                            .select("timelineProjectID subjectName")
                            .populate("timelineProjectID")
                            .then(project => {
                                if (project) {
                                    return {
                                        name: project.timelineProjectID.name || "暂无项目名",
                                        parentID: project.timelineProjectID.activityID,
                                    }
                                }
                            })
                    }
                },
            },
        },

        TeacherPrivateSpace: {
            path: id => {
                return {
                    path: `/course/section/activity/view/${id}`,
                    query: {
                        tab: "overview",
                    },
                }
            },
            parent: "ActivityView",
            meta: { title: "私有空间" },
        },
        TeacherViewPrivateTimeline: {
            path: "/course/section/activity/timeline/overview/private/view/",
            parent: "TeacherPrivateSpace",

            meta: {
                title: async id => {
                    if (/^[a-fA-F0-9]{24}$/.test(id)) {
                        return await TimeLineProject.findById(id)
                            .select("activityID name")
                            .then(project => {
                                if (project) {
                                    return {
                                        name: project.name || "暂无项目名",
                                        parentID: project.activityID,
                                    }
                                }
                            })
                    }
                },
            },
        },
        TeacherViewPrivateStage: {
            path: "/course/section/activity/timeline/private/stage/overview/private/view/",
            parent: "TeacherViewPrivateTimeline",
            meta: {
                title: async id => {
                    if (/^[a-fA-F0-9]{24}$/.test(id)) {
                        return await Stage.findById(id)
                            .select("timelineProjectID subjectName")
                            .then(project => {
                                if (project) {
                                    return {
                                        name: project.subjectName || "暂无阶段名",
                                        parentID: project.timelineProjectID,
                                    }
                                }
                            })
                    }
                },
            },
        },
        ViewEvaluation: {
            path: "/course/section/activity/evaluation/view/",
            parent: "ActivityView",
            meta: {
                title: async id => {
                    if (/^[a-fA-F0-9]{24}$/.test(id)) {
                        return await EvaluationWork.findById(id)
                            .select("activityID")
                            .then(work => {
                                if (work) {
                                    return {
                                        name: "详情与互评",
                                        parentID: work.activityID,
                                    }
                                }
                            })
                    }
                },
            },
        },
        UserManager: {
            parent: "Home",
            redirect: "noRedirect",
            meta: {
                title: "用户管理",
            },
        },
        TeacherManager: {
            parent: "UserManager",
            meta: {
                title: "教师管理",
            },
        },
        StudentManager: {
            parent: "UserManager",
            meta: {
                title: "学生管理",
            },
        },
        AdminManager: {
            parent: "UserManager",
            meta: {
                title: "管理员管理",
            },
        },
        CourseManager: {
            parent: "Home",
            redirect: "noRedirect",
            meta: {
                title: "课程管理",
            },
        },
    }

    get(name) {
        return this.tree[name]
    }
}
