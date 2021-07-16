<template>
    <el-upload :action="uploadPath" drag multiple :headers="headers">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
        </div>
    </el-upload>
</template>

<script>
import { getToken } from "@/utils/auth"

export default {
    name: "FilesUpload",
    data() {
        return {
            uploadPath: process.env.VUE_APP_BASE_API + process.env.VUE_APP_FILES_API + "/upload",
            headers: {
                token: getToken(),
            },
        }
    },
}
</script>

<style lang='scss' >
.el-upload {
    width: 100%;

    .el-upload-dragger {
        width: 100% !important;
    }
}
</style>
