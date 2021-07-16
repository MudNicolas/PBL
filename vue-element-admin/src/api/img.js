import request from "@/utils/request"

export function uploadImg(data, imgType, cb) {
    let url = ""
    if (imgType == "avatar") {
        url = "/user/uploadAvatar"
    }
    if (imgType == "courseCover") {
        url = "/course/create/cover"
    }

    return request({
        url: url,
        method: "post",
        data,
        onUploadProgress: cb || function() {},
    })
}
