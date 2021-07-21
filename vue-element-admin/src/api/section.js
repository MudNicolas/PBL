import request from "@/utils/request"

export function getSectionView(query) {
    return request({
        url: "/section/view/get",
        method: "get",
        params: query,
    })
}

export function getFileAndUrl(query) {
    return request({
        url: "/section/view/setting/baseContent/get",
        method: "get",
        params: query,
    })
}

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
        url: "/section/view/set",
        method: "post",
        data,
    })
}

export function deleteSection(data) {
    return request({
        url: "/section/view/delete",
        method: "post",
        data,
    })
}
