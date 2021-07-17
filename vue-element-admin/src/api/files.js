import request from "@/utils/request"

export function uploadFile(data, cb, cancelToken) {
    return request({
        url: "/files/upload",
        method: "post",
        data,
        onUploadProgress: cb || function() {},
        timeout: 1000 * 60 * 60,
        cancelToken: cancelToken,
    })
}
