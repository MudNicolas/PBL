<template>
    <el-form>
        <el-form-item style="width: 100%">
            <upload-file
                action="#"
                drag
                multiple
                :on-preview="download"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
                ref="uploadFile"
            >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">
                    将文件拖到此处，或
                    <em>点击上传</em>
                </div>
            </upload-file>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submit" :loading="submitting">提交</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
import uploadFile from "@/components/UploadFile"
import download from "@/utils/download"
import { submitNewFile } from "@/api/section"

export default {
    components: { uploadFile },
    data() {
        return {
            submitting: false,
            files: [],
            sectionID: this.sectionId,
        }
    },
    props: ["sectionId"],
    methods: {
        submit() {
            this.submitting = true
            let filesID = this.files.map(e => {
                return e.response._id
            })
            submitNewFile({ sectionID: this.sectionID, filesID: filesID })
                .then(() => {
                    this.submitting = false
                    this.$message.success("文件添加成功")
                    this.$refs.uploadFile.clearFiles()
                    this.files = []
                    this.$emit("success")
                })
                .catch(() => {
                    this.submitting = false
                })
        },
        download(file) {
            download(file.response._id)
        },
        handleRemove(file, fileList) {
            this.files = fileList
        },
        handleSuccess(response, file, fileList) {
            this.files = fileList
        },
    },
}
</script>

<style lang='scss' >
.el-upload {
    width: 100%;
    .el-upload-dragger {
        width: 100%;
    }
}
</style>
