<template>
    <div class="container" v-loading="loading">
        <el-form label-positoin="right" label-width="80px" :model="section">
            <el-row>
                <el-col :span="16" :offset="4">
                    <el-form-item label="节名">
                        <el-input :disabled="!editable" v-model="section.name" />
                    </el-form-item>
                    <el-form-item label="简介">
                        <el-input
                            :disabled="!editable"
                            type="textarea"
                            v-model="section.info"
                            :autosize="{ minRows: 3 }"
                        />
                    </el-form-item>
                    <el-form-item label="可见性">
                        <el-switch :disabled="!editable" v-model="section.visible" />
                    </el-form-item>
                    <el-form-item style="margin-top: 24px">
                        <div class="tools-wrapper">
                            <el-button @click="editable = false" v-if="editable">取消</el-button>
                            <el-button
                                type="primary"
                                @click="submit"
                                v-if="editable"
                                key="profile-submit-buttom"
                            >
                                确认提交
                            </el-button>
                            <el-button
                                :loading="submitting"
                                @click="editable = true"
                                v-if="!editable"
                                key="profile-to-edit-buttom"
                            >
                                编辑
                            </el-button>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <h2 style="font-weight: 400; margin-bottom: 8px">Danger Zone</h2>
                        <div class="danger-zone">
                            <div class="item">
                                <div class="text">
                                    <div class="title">移除本节</div>
                                    <div class="info">将本节从课程中移除</div>
                                </div>
                                <div class="button">
                                    <el-button
                                        class="right-wrapper"
                                        type="danger"
                                        @click="deleteSection"
                                    >
                                        移除
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <el-dialog title="删除本节" :visible.sync="deleteComfirmVisible" width="30%">
            <span style="display: flex; flex-direction: column">
                <span style="display: flex; align-items: center">
                    <i class="el-icon-warning" />
                    <p style="color: #606266; line-height: 24px">
                        确认删除此组？删除后本节无法被访问，但如果是误操作可以联系管理员进行恢复。如果确定要删除本节，请输入本节名
                        <b>{{ deleteConfirm.source }}</b>
                    </p>
                </span>
                <span style="margin-left: 36px">
                    <el-input v-model="deleteConfirm.input" @keyup.enter.native="submitDelete" />
                </span>
            </span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="deleteComfirmVisible = false">取 消</el-button>
                <el-button
                    type="primary"
                    :disabled="deleteConfirm.source !== deleteConfirm.input"
                    @click="submitDelete"
                    :loading="deleteSubmitting"
                >
                    确 定
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { getSectionInfo, sectionSet, deleteSection } from "@/api/section"
export default {
    name: "SectionInfoManage",
    props: ["sectionId"],
    data() {
        return {
            loading: true,
            editable: false,
            section: {},
            sectionID: this.sectionId,
            submitting: false,
            deleteComfirmVisible: false,
            deleteConfirm: {
                source: "",
                input: "",
            },
            deleteSubmitting: false,
        }
    },
    created() {
        this.getSectionInfo()
    },
    methods: {
        getSectionInfo() {
            this.loading = true
            getSectionInfo({ sectionID: this.sectionID }).then(res => {
                this.section = res.data
                this.loading = false
            })
        },
        submit() {
            this.submitting = true
            sectionSet({ section: this.section })
                .then(() => {
                    this.submitting = false
                    this.$message.success("更新信息成功")
                })
                .catch(() => {
                    this.submitting = false
                })
        },
        deleteSection() {
            this.deleteConfirm.source = this.section.name
            this.deleteComfirmVisible = true
        },
        submitDelete() {
            if (this.deleteConfirm.source !== this.deleteConfirm.input || this.deleteSubmitting) {
                return
            }
            this.deleteSubmitting = true
            deleteSection({ sectionID: this.sectionID })
                .then(res => {
                    this.deleteSubmitting = false
                    this.deleteComfirmVisible = false
                    this.deleteConfirm = {
                        source: "",
                        input: "",
                    }
                    this.$message({
                        type: "success",
                        message: "删除成功",
                    })
                    let toPath = res.toPath
                    this.$router.replace(toPath)
                })
                .catch(() => {
                    this.deleteSubmitting = false
                })
        },
    },
}
</script>

<style lang='scss' scoped>
.container {
    min-height: 200px;
    padding: 30px;
    color: #606266;

    .tools-wrapper {
        display: flex;
        align-items: center;
        margin-bottom: 18px;
        flex-direction: row;
        justify-content: flex-start;
    }
    .right-wrapper {
        margin-left: auto;
    }
}
.el-icon-warning {
    color: #e6a23c;
    font-size: 24px;
    margin-right: 12px;
}

.item {
    display: flex;
    align-items: center;
    padding: 16px;

    color: #303133;

    .title {
        font-size: 16px;
    }

    .info {
        line-height: 1.5715;
    }

    .button {
        margin-left: auto;
    }
}

.danger-zone {
    border: 1px solid #f56c6c;
    border-radius: 6px;

    .item:not(:last-child) {
        border-bottom: 1px solid #e4e7ed;
    }
}
</style>
