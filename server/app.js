import express from "express"
import mongoose from "mongoose"
import path from "path"
import api from "./routers/api.js"
import { PORT } from "./settings.js"
import { dirname } from "path"
import { fileURLToPath } from "url"

var app = express()

app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:9527")
    res.header("Access-Control-Allow-Headers", "X-Requested-With,content-type,token")
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
    res.header("X-Powered-By", " 3.2.1")
    res.header("Content-Type", "application/json;charset=utf-8")
    res.header("Access-Control-Allow-Credentials", "true")
    next()
})

app.use(
    express.urlencoded({
        extended: true,
    })
)
app.use(express.json())

const __dirname = dirname(fileURLToPath(import.meta.url))
app.use("/public", express.static(path.join(__dirname, "public")))

//拦截preflight的option请求
app.use("*", (req, res, next) => {
    if (req.method == "OPTIONS") {
        res.end()
    } else {
        next()
    }
})

app.use("/api", api)

let mongoUrl = "mongodb://localhost:27027/PBL"
let options = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
}

mongoose.connect(mongoUrl, options, function (err) {
    if (err) {
        console.log("fail")
    } else {
        console.log("success")
        /**监听http请求 */
        app.listen(PORT)
    }
})
