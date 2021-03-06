import request from "@/utils/request"

export function submitCreateActivity(data) {
    return request({
        url: "/activity/create",
        method: "post",
        data,
    })
}

export function getActivityInfo(query) {
    return request({
        url: "/activity/view/type/get",
        method: "get",
        params: query,
    })
}

export function getPrivateTimeline(query) {
    return request({
        url: "/activity/view/timeline/private/get",
        method: "get",
        params: query,
    })
}
