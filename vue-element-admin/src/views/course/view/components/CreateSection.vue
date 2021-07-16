<template>
    <div class="container">
        <el-form label-position="right" label-width="80px">
            <el-row>
                <el-col :span="14" :offset="5">
                    <el-form-item label="节名">
                        <el-input />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="14" :offset="5">
                    <el-form-item label="简介">
                        <el-input type="textarea" :autosize="{ minRows: 2 }" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="14" :offset="5">
                    <el-form-item label="可见性">
                        <el-switch />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="14" :offset="5">
                    <el-form-item label="上传文件">
                        <files-upload />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script>
import filesUpload from "@/components/FilesUpload"
export default {
    name: "CreateSection",
    components: { filesUpload },
    data() {
        return {}
    },
    methods: {},
}
</script>

<style lang='scss' scoped>
.container {
    padding: 30px;
}
</style>
