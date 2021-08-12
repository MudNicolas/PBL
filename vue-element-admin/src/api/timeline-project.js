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

export function autosave(data) {
    return request({
        url: "/activity/view/timeline/stage/editor/autosave",
        method: "post",
        data,
    })
}

export function saveStage(data) {
    return request({
        url: "/activity/view/timeline/stage/save",
        method: "post",
        data,
    })
}

export function getComments(query) {
    return request({
        url: "/activity/view/timeline/stage/comments/get",
        method: "get",
        params: query,
    })
}
