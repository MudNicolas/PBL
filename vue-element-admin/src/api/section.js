import request from "@/utils/request"
import { connect } from "echarts"

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
        method: "delete",
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

export function deleteUrl(data) {
    //只能删除url和file
    return request({
        url: "/section/manage/content/link/delete",
        method: "delete",
        data,
    })
}

export function submitNewFile(data) {
    return request({
        url: "/section/manage/content/file/submit",
        method: "post",
        data,
    })
}

export function deleteFile(data) {
    return request({
        url: "/section/manage/content/file/delete",
        method: "delete",
        data,
    })
}

export function activityGetCommentTemplate(query) {
    return request({
        url: "/section/manage/activity/commentTemplate/get",
        method: "get",
        params: query,
    })
}

export function inActivitySubmitNewCommentTemplate(data) {
    return request({
        url: "/section/manage/activity/commentTemplate/new",
        method: "post",
        data,
    })
}
