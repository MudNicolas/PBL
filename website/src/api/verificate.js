import request from "@/utils/request"

export function verification(url, data) {
    return request({
        url: url,
        method: "delete",
        data,
    })
}
