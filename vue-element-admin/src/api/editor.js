import request from "@/utils/request"

export function autosave(url, data) {
    return request({
        url,
        method: "post",
        data,
    })
}
