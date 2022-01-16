import request from "@/utils/request"

export function getUser(query) {
    return request({
        url: "/admin/user/role/all/get",
        method: "get",
        params: query,
    })
}

export function submitUser(data) {
    return request({
        url: "/admin/user/role/submit",
        method: "post",
        data,
    })
}

export function userSearch(query) {
    return request({
        url: "/admin/user/role/search",
        method: "get",
        params: query,
    })
}

export function getInfo(query) {
    return request({
        url: "/admin/user/getInfo",
        method: "get",
        params: query,
    })
}

export function resetPWD(data) {
    return request({
        url: "/admin/user/resetPWD",
        method: "post",
        data,
    })
}
