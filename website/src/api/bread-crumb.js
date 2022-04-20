import request from "@/utils/request"

export function getBreadCrumb(query) {
    return request({
        url: "/breadCrumb/get",
        method: "get",
        params: query,
    })
}
