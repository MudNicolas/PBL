import request from "@/utils/request"

export function getCourseInfo(data) {
    return request({
        url: '/view/getInfo',
        method: 'post',
        data

    })
}