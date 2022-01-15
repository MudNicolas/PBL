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
