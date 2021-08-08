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
