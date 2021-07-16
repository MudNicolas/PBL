<template>
    <el-upload
        action="#"
        :http-request="upload"
        drag
        multiple
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-remove="handleRemove"
        :on-preview="handlePreview"
    >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
        </div>
    </el-upload>
</template>

<script>
import { getToken } from "@/utils/auth"
import { uploadFile } from "@/api/files"

export default {
    name: "FilesUpload",
    data() {
        return {
            uploadPath: process.env.VUE_APP_BASE_API + process.env.VUE_APP_FILES_API + "/upload",
            headers: {
                token: getToken(),
            },
            fileList: [],
        }
    },
    methods: {
        upload(file) {
            console.log(file)
            uploadFile(file)
        },
        handleSuccess(response, file, fileList) {
            if (response.code !== 20000) {
                this.$message.error(response.error)
                console.log(file, fileList, fileList.indexOf(file))

                return
            }
            this.fileList = fileList
        },
        handleError() {
            this.$message.error("文件上传失败")
        },
        handleRemove(file, fileList) {
            this.fileList = fileList
        },
        handlePreview(file) {
            console.log(file)
        },
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

.el-list-enter-active,
.el-list-leave-active {
    -webkit-transition: all 0s !important;
    transition: all 0s !important;
}
</style>
