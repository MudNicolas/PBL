import request from "@/utils/request"

export function getTimelineStatisticData(query) {
    return request({
        url: "/activity/view/timeline/statistic/get",
        method: "get",
        params: query,
    })
}

export function teacherGetAllStatistics(query) {
    return request({
        url: "/activity/view/timeline/statistic/teacher/get/all",
        method: "get",
        params: query,
    })
}
