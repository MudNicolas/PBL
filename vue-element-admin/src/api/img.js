import request from '@/utils/request'

export function uploadImg(data, imgType) {
    if (imgType == 'avatar') {
        return request({
            url: '/user/uploadAvatar',
            method: 'post',
            data
        })
    }
    if (imgType == 'courseCover') {
        return request({
            url: '/course/create/cover',
            method: 'post',
            data
        })
    }
}