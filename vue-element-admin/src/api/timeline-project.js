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
        url: "/activity/view/timeline/stage/get",
        method: "get",
        params: query,
    })
}

export function saveStage(data) {
    return request({
        url: "/activity/view/timeline/stage/save",
        method: "post",
        data,
    })
}

export function getStageInfo(query) {
    return request({
        url: "/activity/view/timeline/stage/manage/info/get",
        method: "get",
        params: query,
    })
}

export function manageSaveInfo(data) {
    return request({
        url: "/activity/view/timeline/stage/manage/info/save",
        method: "post",
        data,
    })
}

export function getEditLog(query) {
    return request({
        url: "/activity/view/timeline/stage/manage/editLog/get",
        method: "get",
        params: query,
    })
}
