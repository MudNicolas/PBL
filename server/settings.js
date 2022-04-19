let env = process.argv[2]

//服务端地址
const SERVER_IP = "https://pbl.jinxy.cn"

//开发用服务器地址，用于测试，部署时无须修改
if (env === "dev") {
    SERVER_IP = "http://127.0.0.1:14758"
}

//app.listen监听的端口
const PORT = 14758

//可访问的服务端地址，与SERVER_IP相同
const SERVER_ADDRESS = `${SERVER_IP}`

//课程封面图片存储地址
const COVER_PATH = `${SERVER_ADDRESS}/public/img/course/`

//用户头像图片存储地址
const AVATAR_PATH = `${SERVER_ADDRESS}/public/img/avatar/`

//用户默认密码
const DEFAULT_PASSWORD = "123456"

//非对称加密密钥，必须是16位长度
const SECRET_KEY = "NicolasAirlineWH"

//非堆成加密偏移值，必须是16位长度
const IV = "WUHUWUHUWUHUWUHU"

//前端网页部署地址
const PROD_ORIGIN = "http://localhost:9527"

export {
    SERVER_IP,
    PORT,
    SERVER_ADDRESS,
    COVER_PATH,
    AVATAR_PATH,
    DEFAULT_PASSWORD,
    SECRET_KEY,
    IV,
    PROD_ORIGIN,
}
