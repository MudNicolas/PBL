import request from "@/utils/request"

export function createSection(data) {
    return request({
        url: "/section/create",
        method: "post",
        data,
    })
}

export function sectionSort(data) {
    return request({
        url: "/section/sort",
        method: "post",
        data,
    })
}

export function sectionSet(data) {
    return request({
        url: "/section/set",
        method: "post",
        data,
    })
}

export function deleteSection(data) {
    return request({
        url: "/section/delete",
        method: "post",
        data,
    })
}
