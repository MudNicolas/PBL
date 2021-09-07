import request from "@/utils/request"

export function createProject(data) {
    return request({
        url: "/activity/view/timeline/private/project/create",
        method: "post",
        data,
    })
}

export function submitEditIntro(data) {
    return request({
        url: "/activity/view/timeline/private/project/edit",
        method: "post",
        data,
    })
}

export function newStageSubmit(data) {
    return request({
        url: "/activity/view/timeline/private/project/stage/new",
        method: "post",
        data,
    })
}

export function getStage(query) {
    return request({
        url: "/activity/view/timeline/private/stage/get",
        method: "get",
        params: query,
    })
}

export function saveStage(data) {
    return request({
        url: "/activity/view/timeline/private/stage/save",
        method: "post",
        data,
    })
}

export function getStageInfo(query) {
    return request({
        url: "/activity/view/timeline/private/stage/manage/info/get",
        method: "get",
        params: query,
    })
}

export function manageSaveInfo(data) {
    return request({
        url: "/activity/view/timeline/private/stage/manage/info/save",
        method: "post",
        data,
    })
}

export function getEditLog(query) {
    return request({
        url: "/activity/view/timeline/private/stage/manage/editLog/get",
        method: "get",
        params: query,
    })
}

export function submitDangerOperation(data) {
    return request({
        url: "/activity/view/timeline/private/stage/manage/danger/submit",
        method: "post",
        data,
    })
}

export function getPubProjects(query) {
    return request({
        url: "/activity/view/timeline/public/all/get",
        method: "get",
        params: query,
    })
}

export function getPubicProject(query) {
    return request({
        url: "/activity/view/timeline/public/single/get",
        method: "get",
        params: query,
    })
}

export function getPubicStage(query) {
    return request({
        url: "/activity/view/timeline/public/stage/get",
        method: "get",
        params: query,
    })
}

export function teacherGetAllProject(query) {
    return request({
        url: "/activity/view/timeline/teacher/all/get",
        method: "get",
        params: query,
    })
}

export function resetStatus(data) {
    return request({
        url: "/activity/view/timeline/teacher/manage/status/reset",
        method: "post",
        data,
    })
}
