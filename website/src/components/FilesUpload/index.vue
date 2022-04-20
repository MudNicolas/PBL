<template>
    <upload-file
        :action="uploadPath"
        drag
        multiple
        :headers="headers"
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
    </upload-file>
</template>

<script>
import { getToken } from "@/utils/auth"
import UploadFile from "@/components/UploadFile"
import download from "@/utils/download"

export default {
    name: "FilesUpload",
    components: { UploadFile },
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
        handleSuccess(response, file, fileList) {
            this.fileList = fileList
        },
        handleError() {
            this.$message.error("文件上传失败")
        },
        handleRemove(file, fileList) {
            this.fileList = fileList
        },
        handlePreview(file) {
            if (file.response && file.response._id) {
                download(file.response._id)
            }
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
