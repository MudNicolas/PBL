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
