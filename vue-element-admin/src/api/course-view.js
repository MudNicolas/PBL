import request from "@/utils/request"

export function getCourseView(query) {
    return request({
        url: "/view/get",
        method: "get",
        params: query,
    })
}
