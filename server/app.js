import express from "express"
import mongoose from "mongoose"
import path from "path"
import cors from "cors"
import api from "./routers/api.js"
import { PORT, PROD_ORIGIN } from "./settings.js"
import { dirname } from "path"
import { fileURLToPath } from "url"

var app = express()

let origin

let env = process.argv[2]
if (env === "dev") {
    console.log(env)
    origin = "*"
} else {
    origin = PROD_ORIGIN
}

/* app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", origin)
    res.header("Access-Control-Allow-Headers", "X-Requested-With,content-type,token")
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
    res.header("X-Powered-By", " 3.2.1")
    res.header("Content-Type", "application/json;charset=utf-8")
    res.header("Access-Control-Allow-Credentials", "true")
    next()
})
 */
app.use(
    cors({
        allowedHeaders: ["X-Requested-With", "content-type", "token"],
        origin: origin,
        preflightContinue: false,
    })
)

app.use(
    express.urlencoded({
        extended: true,
    })
)
app.use(express.json())

const __dirname = dirname(fileURLToPath(import.meta.url))
app.use("/public", express.static(path.join(__dirname, "public")))

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

//全局错误处理
import fs from "fs"
process
    .on("unhandledRejection", reason => {
        console.error(reason, "Unhandled Rejection at Promise")
        let log = `>>> [${new Date()}]	<Unhandled Rejection at Promise>	${reason.stack}`
        writeErrLog(log)
    })
    .on("uncaughtException", err => {
        console.error(err, "Uncaught Exception thrown")
        process.exit(1)
    })

function writeErrLog(log) {
    fs.createWriteStream(path.join(__dirname, "logs", "error.log"), {
        flags: "a", //'a'为追加，'w'为覆盖
    }).write(log + "\n")
}
