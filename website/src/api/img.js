import request from "@/utils/request"

export function uploadImg(data, imgType, cb) {
    let url = ""
    if (imgType == "avatar") {
        url = "/user/avatar/upload"
    }
    if (imgType == "courseCover") {
        url = "/course/create/cover"
    }

    return request({
        url: url,
        method: "post",
        data,
        onUploadProgress: cb || function() {},
        timeout: 1000 * 60,
    })
}
