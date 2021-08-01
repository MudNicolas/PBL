import request from "@/utils/request"

export function submitThemeSetting(data) {
    return request({
        url: "/theme/set",
        method: "post",
        data,
    })
}

export function getThemeSetting(query) {
    return request({
        url: "/theme/get",
        method: "get",
        params: query,
    })
}
