import request from "@/utils/request"
import { uploadImg } from "./img"

export function login(data) {
    return request({
        url: "/login",
        method: "post",
        data,
    })
}

export function getInfo() {
    return request({
        url: "/user/info",
        method: "get",
    })
}

export function logout() {
    return request({
        url: "/logout",
        method: "post",
    })
}

export function changeInfo(data) {
    return request({
        url: "/user/changeInfo",
        method: "post",
        data,
    })
}

export function uploadAvatar(data, imgType, cb) {
    return uploadImg(data, imgType, cb)
}

export function sendPWD(data) {
    return request({
        url: "/user/updatePWD",
        method: "post",
        data,
    })
}

export function getProfilePopoverInfo(data) {
    return request({
        url: "/user/getProfilePopoverInfo",
        method: "post",
        data,
    })
}
