import request from "@/utils/request"

export function createProject(data) {
    return request({
        url: "/activity/view/timeline/private/project/create",
        method: "post",
        data,
    })
}
