const SERVER_IP = () => {
    if (env === "dev") {
        return "http://127.0.0.1"
    } else {
        return "https://pbl.jinxy.cn"
    }
}
const PORT = 14758
const SERVER_ADDRESS = `${SERVER_IP}:${PORT}`
const COVER_PATH = `${SERVER_ADDRESS}/public/img/course/`
const AVATAR_PATH = `${SERVER_ADDRESS}/public/img/avatar/`
const DEFAULT_PASSWORD = "123456"
//16位
const SECRET_KEY = "NicolasAirlineWH"
//16位
const IV = "WUHUWUHUWUHUWUHU"

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
