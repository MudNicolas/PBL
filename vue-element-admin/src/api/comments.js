import request from "@/utils/request"

export function getComments(query) {
    return request({
        url: "/activity/view/comments/get",
        method: "get",
        params: query,
    })
}
