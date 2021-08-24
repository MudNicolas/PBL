import request from "@/utils/request"

export function getAvtivityType(query) {
    return request({
        url: "/activity/manage/type/get",
        methods: "get",
        params: query,
    })
}

export function getActivityInfo(query) {
    return request({
        url: "/activity/manage/info/get",
        methods: "get",
        params: query,
    })
}

export function submitEditActivity(data) {
    return request({
        url: "/activity/manage/info/submit",
        method: "post",
        data,
    })
}

export function submitRemoveActivity(data) {
    return request({
        url: "/activity/manage/remove/submit",
        method: "delete",
        data,
    })
}

export function getPendingApproveProjectStage(query) {
    return request({
        url: "/activity/manage/timelineProject/approve/get",
        method: "get",
        params: query,
    })
}

export function getProjectUnderApproveStage(query) {
    return request({
        url: "/activity/manage/timelineProject/approve/single/get",
        method: "get",
        params: query,
    })
}

export function submitApprovement(data) {
    return request({
        url: "/activity/manage/timelineProject/approve/single/submit",
        method: "post",
        data,
    })
}
