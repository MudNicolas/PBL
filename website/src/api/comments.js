import request from "@/utils/request"

export function getComments(query) {
    return request({
        url: "/activity/view/comments/get",
        method: "get",
        params: query,
    })
}

export function submitComment(data) {
    return request({
        url: "/activity/view/comments/submit",
        method: "post",
        data,
    })
}

export function removeComment(data) {
    return request({
        url: "/activity/view/comments/remove",
        method: "post",
        data,
    })
}

export function submitReply(data) {
    return request({
        url: "/activity/view/comments/reply/submit",
        method: "post",
        data,
    })
}

export function removeReply(data) {
    return request({
        url: "/activity/view/comments/reply/remove",
        method: "post",
        data,
    })
}
