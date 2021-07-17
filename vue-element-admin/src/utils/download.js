import store from "@/store"
import { getToken } from "@/utils/auth"
import { downloadCheck } from "@/api/files"

function download(_id) {
    let downloadElement = document.createElement("a")
    let href = process.env.VUE_APP_BASE_API + process.env.VUE_APP_FILES_API + "/download?_id=" + _id
    let token = ""
    if (store.getters.token) {
        token = getToken()
    }
    href += "&token=" + token
    downloadElement.href = href
    downloadElement.click()
}

function preCheck(_id) {
    downloadCheck({ _id: _id }).then(() => {
        download(_id)
    })
}

export default preCheck
