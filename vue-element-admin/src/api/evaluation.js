import request from "@/utils/request"

export function teacherGetAllWorks(query) {
    return request({
        url: "/activity/view/evaluation/teacher/all/get",
        method: "get",
        params: query,
    })
}

export function getMyWork(query) {
    return request({
        url: "/activity/view/evaluation/work/my/get",
        method: "get",
        params: query,
    })
}

export function getWork(query) {
    return request({
        url: "/activity/view/evaluation/work/others/get",
        method: "get",
        params: query,
    })
}

export function createWork(data) {
    return request({
        url: "/activity/view/evaluation/work/my/create",
        method: "post",
        data,
    })
}

export function submitWork(data) {
    return request({
        url: "/activity/view/evaluation/work/my/save",
        method: "post",
        data,
    })
}
