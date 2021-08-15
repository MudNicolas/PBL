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
