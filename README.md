# PBL

![image](https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif)

## 获取源文件

推荐使用 `git clone` 命令获取源文件

## 获取源文件后

### 对于服务端

- `cd server` 进入服务端文件夹
- `npm install` 安装依赖（推荐使用 yarn 进行依赖管理）
- 修改`setting.js`内的配置参数
- `node/nodemon/supervisor app.js` 开启服务/自动重启服务（推荐使用 pm2 进行服务管理，pm2 配置文件位于`/server/pm2.json`，其中`"cwd"`字段为服务端根目录，`"error_file"` `"out_file"`为错误日志保存地址与输出信息日志保存地址，`"watch"`字段为需要监听变化自动重启服务的文件，全部设定好后使用`pm2 start pm2.json`开启服务。pm2详细使用方法见相关文档中的链接）

### 对于前端

- `cd vue-element-admin`
- `npm install` 安装依赖（推荐使用 yarn 进行依赖管理）
- 修改`.env.production`中的配置参数
- `npm run build:prod` 构建网页文件，在生成`dist`目录之后使用 nginx 或 iis 等进行静态部署

## 相关文档

- vuejs 官方文档：<https://cn.vuejs.org/v2/guide/>
- vue-element-admin 官方文档：<https://panjiachen.gitee.io/vue-element-admin-site/zh/guide/#%E5%8A%9F%E8%83%BD>
- element-ui 官方文档：<https://element.eleme.cn/#/zh-CN/component/installation>
- froala-editor 官方文档：<https://froala.com/wysiwyg-editor/docs/options/>
- mongoose 中文文档：<http://www.mongoosejs.net/docs/index.html>
- pm2 使用参考<https://www.cnblogs.com/huiguo/p/12694542.html/>
- yarn 官方文档<https://www.yarnpkg.cn/>
- git 官方文档<https://git-scm.com/>
