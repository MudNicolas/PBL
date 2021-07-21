import request from "@/utils/request"

export function getSectionView(query) {
    return request({
        url: "/section/view/get",
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

//manage
export function getSectionInfo(query) {
    return request({
        url: "/section/manage/info/get",
        method: "get",
        params: query,
    })
}

export function sectionSet(data) {
    return request({
        url: "/section/manage/info/set",
        method: "post",
        data,
    })
}

export function deleteSection(data) {
    return request({
        url: "/section/manage/delete",
        method: "post",
        data,
    })
}

export function getFileAndUrl(query) {
    return request({
        url: "/section/manage/content/get",
        method: "get",
        params: query,
    })
}

export function submitNewLinks(data) {
    return request({
        url: "/section/manage/content/link/new",
        method: "post",
        data,
    })
}

export function submitEditUrl(data) {
    return request({
        url: "/section/manage/content/link/edit",
        method: "post",
        data,
    })
}

export function deleteBaseContent(data) {
    return request({
        url: "/section/manage/content/delete",
        method: "post",
        data,
    })
}
