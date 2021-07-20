<template>
    <el-form-item style="width: 100%">
        <upload-file action="#" drag multiple>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
                将文件拖到此处，或
                <em>点击上传</em>
            </div>
        </upload-file>
    </el-form-item>
</template>

<script>
import uploadFile from "@/components/UploadFile"

export default {
    components: { uploadFile },
}
</script>

<style lang='scss' scoped>
.el-upload {
    width: 100%;
    .el-upload-dragger {
        width: 100%;
    }
}
</style>
