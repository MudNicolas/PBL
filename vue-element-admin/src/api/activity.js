import request from "@/utils/request"

export function submitCreateActivity(data) {
    return request({
        url: "/activity/create",
        method: "post",
        data,
    })
}
