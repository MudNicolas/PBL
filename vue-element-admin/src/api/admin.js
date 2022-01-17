import request from '@/utils/request'

export function getUser(query) {
    return request({
        url: '/admin/user/role/all/get',
        method: 'get',
        params: query
    })
}

export function submitUser(data) {
    return request({
        url: '/admin/user/role/submit',
        method: 'post',
        data
    })
}

export function userSearch(query) {
    return request({
        url: '/admin/user/role/search',
        method: 'get',
        params: query
    })
}

export function getInfo(query) {
    return request({
        url: '/admin/user/getInfo',
        method: 'get',
        params: query
    })
}

export function resetPWD(data) {
    return request({
        url: '/admin/user/resetPWD',
        method: 'post',
        data
    })
}

export function removeUser(data) {
    return request({
        url: '/admin/user/removeUser',
        method: 'delete',
        data
    })
}

export function removeAdminRole(data) {
    return request({
        url: '/admin/user/removeAdminRole',
        method: 'delete',
        data
    })
}

export function setAdmin(data) {
    return request({
        url: '/admin/user/setAdmin',
        method: 'post',
        data
    })
}

export function getCourse(query) {
    return request({
        url: '/admin/course/getAll',
        method: 'get',
        params: query
    })
}

export function getCourseInfo(query) {
    return request({
        url: '/admin/course/getInfo',
        method: 'get',
        params: query
    })
}

export function removeCourse(data) {
    return request({
        url: '/admin/course/remove',
        method: 'delete',
        data
    })
}

export function handleRecover(data) {
    return request({
        url: '/admin/course/recover',
        method: 'post',
        data
    })
}
