import request from "@/utils/request"

export function deleteSection(data) {
    return request({
        url: "/section/delete",
        method: "post",
        data,
    })
}
