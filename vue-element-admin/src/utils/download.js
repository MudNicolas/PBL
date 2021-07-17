import store from "@/store"
import { getToken } from "@/utils/auth"

function download(_id) {
    let downloadElement = document.createElement("a")
    let href = process.env.VUE_APP_BASE_API + process.env.VUE_APP_FILES_API + "/download?_id=" + _id
    let token = ""
    if (store.getters.token) {
        token = getToken()
    }
    href += "&token=" + token
    downloadElement.href = href
    downloadElement.target = "_blank"
    downloadElement.click()
}

export default download
