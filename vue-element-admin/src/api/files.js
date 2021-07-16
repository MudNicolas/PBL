import request from "@/utils/request"

export function uploadFile(data) {
    return request({
        url: "/files/upload",
        method: "post",
        data,
    })
}
