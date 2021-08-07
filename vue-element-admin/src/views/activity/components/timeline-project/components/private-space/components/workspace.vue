<template>
    <div>
        <el-row>
            <el-col :span="5">
                <el-card>
                    <div slot="header" class="clearfix">
                        <span>{{ project.name }}</span>
                        <el-button
                            style="margin-left: auto"
                            type="text"
                            @click="handleEditButtonClick"
                        >
                            <span v-if="!isIntroEdit">编辑</span>
                            <span v-else key="cancel">取消</span>
                        </el-button>
                    </div>
                    <div class="intro">
                        <div
                            v-if="!isIntroEdit"
                            key="intro"
                            class="text"
                            @dblclick="isIntroEdit = true"
                        >
                            {{ project.intro | noIntro }}
                        </div>
                        <div v-else>
                            <el-form>
                                <el-form-item>
                                    <el-input v-model="editIntro" type="textarea" autosize />
                                </el-form-item>
                                <el-form-item>
                                    <el-button
                                        type="primary"
                                        style="float: right"
                                        size="mini"
                                        @click="handleSubmitEditIntro"
                                        :loading="introEditSubmitting"
                                    >
                                        提交
                                    </el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { submitEditIntro } from "@/api/timeline-project"
export default {
    props: ["project"],
    filters: {
        noIntro: function (val) {
            if (!val) {
                return "暂无简介"
            }
            return val
        },
    },
    data() {
        return {
            isIntroEdit: false,
            editIntro: "",
            introEditSubmitting: false,
        }
    },
    methods: {
        handleEditButtonClick() {
            this.isIntroEdit = !this.isIntroEdit
            this.editIntro = this.project.intro
        },
        handleSubmitEditIntro() {
            let projectID = this.project._id
            let intro = this.editIntro
            this.introEditSubmitting = true
            submitEditIntro({ projectID, intro })
                .then(() => {
                    this.introEditSubmitting = false
                    this.$message.success("修改成功")
                    this.isIntroEdit = false
                    this.$emit("editIntroSuccess", intro)
                })
                .catch(() => {
                    this.introEditSubmitting = false
                })
        },
    },
}
</script>

<style lang='scss' >
.clearfix {
    font-size: 20px;
    display: flex;
    align-items: center;
}
.intro {
    font-size: 14px;
    margin-bottom: 12px;
    color: #606266;

    .text {
        line-height: 1.5;
    }
}
</style>
