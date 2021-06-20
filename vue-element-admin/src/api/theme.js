import request from '@/utils/request'

export function submitThemeSetting(data) {
    return request({
        url: '/theme/set',
        method: 'post',
        data
    })
}

export function getThemeSetting(data) {
    return request({
        url: '/theme/get',
        method: 'post',
        data
    })
}

