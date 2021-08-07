<template>
    <el-row>
        <el-col :span="16">
            <el-form label-position="right" label-width="80px" :model="project">
                <el-form-item
                    label="项目名称"
                    :rules="{
                        required: true,
                        message: '项目名不能为空',
                        trigger: 'blur',
                    }"
                    prop="name"
                >
                    <el-input v-model="project.name" />
                </el-form-item>
                <el-form-item label="项目名称" prop="intro">
                    <el-input type="textarea" :autosize="{ minRows: 3 }" />
                </el-form-item>
                <el-form-item>
                    <el-button
                        type="primary"
                        :loading="submitting"
                        @click="handleSubmit"
                        :disabled="!project.name.trim()"
                    >
                        提交
                    </el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<script>
export default {
    data() {
        return {
            submitting: false,
            project: {
                name: "",
                intro: "",
            },
        }
    },
    methods: {
        handleSubmit() {
            this.project.name = this.project.name.trim()
            this.project.intro = this.project.intro.trim()
            let project = this.project
            if (!project.name) {
                this.$message.warning("项目名不能为空")
                return
            }
            //TODO submit new project
        },
    },
}
</script>

<style>
</style>
