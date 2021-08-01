<template>
    <el-row>
        <el-col :span="16">
            <el-form
                label-position="right"
                label-width="80px"
                :model="section"
                @submit.native.prevent
            >
                <el-form-item
                    label="节名"
                    prop="name"
                    :rules="{
                        required: true,
                        message: '节名不能为空',
                        trigger: 'blur',
                    }"
                >
                    <el-input v-model="section.name" />
                </el-form-item>

                <el-form-item label="可见性">
                    <el-switch v-model="section.visible" />
                </el-form-item>
                <el-form-item>
                    <el-button
                        :loading="submitting"
                        :disabled="section.name.trim() === ''"
                        type="primary"
                        @click="submit"
                    >
                        确认
                    </el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<script>
import { createSection } from "@/api/section"

export default {
    name: "CreateSection",
    props: ["courseId"],
    created() {
        this.courseID = this.courseId
    },
    data() {
        return {
            section: {
                name: "",
                visible: true,
            },
            submitting: false,
            courseID: "",
            newSectionID: "",
        }
    },
    methods: {
        submit() {
            this.section.name = this.section.name.trim()
            if (this.section.name) {
                this.loading = true
                createSection({ courseID: this.courseID, section: this.section })
                    .then(() => {
                        this.loading = false
                        this.$message.success("创建成功")
                        this.section = {
                            name: "",
                            visible: true,
                        }
                        this.$emit("success")
                    })
                    .catch(() => {
                        this.loading = false
                    })
            }
        },
    },
}
</script>


