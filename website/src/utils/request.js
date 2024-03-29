import axios from "axios"
import { MessageBox, Message } from "element-ui"
import store from "@/store"
import { getToken } from "@/utils/auth"
import router from "@/router"

// create an axios instance
const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
    withCredentials: false, // send cookies when cross-domain requests
    timeout: 5000, // request timeout
})

// request interceptor
service.interceptors.request.use(
    config => {
        // do something before request is sent

        if (store.getters.token) {
            // let each request carry token
            // ['token'] is a custom headers key
            // please modify it according to the actual situation
            config.headers["token"] = getToken()
        }
        // console.log(config)
        return config
    },
    error => {
        // do something with request error
        console.log(error) // for debug
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
     */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    response => {
        const res = response.data

        // if the custom code is not 20000, it is judged as an error.
        if (res.code !== 20000) {
            if (res.code === 1023) {
                router.push({ name: "Verificate", params: res.data })
            }

            Message({
                message: res.message || "Error",
                type: "error",
                duration: 5 * 1000,
            })

            //401 404
            if (res.code === 401 || res.code === 404) {
                router.push(`/${res.code}`)
            }

            // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
            if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
                // to re-login
                MessageBox.confirm(
                    res.message || "你可能在此前已经退出登录、凭证过期或在其他地方登录，请重新登陆",
                    "Relogin",
                    {
                        confirmButtonText: "重新登录",
                        cancelButtonText: "取消",
                        type: "warning",
                    }
                )
                    .then(() => {
                        store.dispatch("user/resetToken").then(() => {
                            location.reload()
                        })
                    })
                    .catch(() => {
                        store.dispatch("user/resetToken")
                    })
            }
            return Promise.reject(new Error(res.message || "Error"))
        } else {
            return res
        }
    },
    error => {
        console.log("err" + error) // for debug
        Message({
            message: error.message,
            type: "error",
            duration: 5 * 1000,
        })
        return Promise.reject(error)
    }
)

export default service
