import request from "@/utils/request"

export function searchTeacher(data) {
    return request({
        url: "/course/search/teacher",
        method: "post",
        data,
    })
}

export function getCourseList(query) {
    return request({
        url: "/course/getList",
        method: "get",
        params: query,
    })
}

export function uploadCreateCourse(data) {
    return request({
        url: "/course/create",
        method: "post",
        data,
    })
}

export function getCourseRoute() {
    return request({
        url: "/course/route",
        method: "get",
    })
}

export function getInfo(query) {
    return request({
        url: "/course/manage/info/get",
        method: "get",
        params: query,
    })
}

export function submitEdit(data) {
    return request({
        url: "/course/manage/info/edit",
        method: "post",
        data,
    })
}

export function getStudentList(query) {
    return request({
        url: "/course/manage/student/get",
        method: "get",
        params: query,
    })
}

export function submitStudentList(data) {
    return request({
        url: "/course/manage/student/submit",
        method: "post",
        data,
    })
}

export function getAllTeacher(query) {
    return request({
        url: "/course/manage/partner/getAllTeacher",
        method: "get",
        params: query,
    })
}

export function manageSearchTeacher(data) {
    return request({
        url: "/course/manage/partner/search/teacher",
        method: "post",
        data,
    })
}

export function addPartnerTeacher(data) {
    return request({
        url: "/course/manage/partner/addTeacher",
        method: "post",
        data,
    })
}

export function getAllCommentTemplate(query) {
    return request({
        url: "/course/manage/commentTemplate/get",
        method: "get",
        params: query,
    })
}

export function submitNewCommentTemplate(data) {
    return request({
        url: "/course/manage/commentTemplate/create",
        method: "post",
        data,
    })
}

export function editCommentTemplate(data) {
    return request({
        url: "/course/manage/commentTemplate/edit",
        method: "post",
        data,
    })
}

export function deleteCommentTemplate(data) {
    return request({
        url: "/course/manage/commentTemplate/delete",
        method: "delete",
        data,
    })
}

export function getGroup(query) {
    return request({
        url: "/course/manage/group/get",
        method: "get",
        params: query,
    })
}

export function getUnGroupedStudents(query) {
    return request({
        url: "/course/manage/group/unGroupedStudents/get",
        method: "get",
        params: query,
    })
}

export function submitNewGroup(data) {
    return request({
        url: "/course/manage/group/create",
        method: "post",
        data,
    })
}

export function getEditData(query) {
    return request({
        url: "/course/manage/group/editData/get",
        method: "get",
        params: query,
    })
}

export function submitEditGroup(data) {
    return request({
        url: "/course/manage/group/edit",
        method: "post",
        data,
    })
}

export function deleteGroup(data) {
    return request({
        url: "/course/manage/group/delete",
        method: "delete",
        data,
    })
}

export function getCourseView(query) {
    return request({
        url: "/course/view/get",
        method: "get",
        params: query,
    })
}
