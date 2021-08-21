<template>
    <div v-loading="loading">
        <el-row class="subtitle">
            <el-col :span="16" :offset="4">
                <div class="subject-name">
                    {{ stage.subjectName | subjectNameFilter }}
                    <el-tag
                        size="mini"
                        style="margin-left: 4px"
                        type="info"
                        v-if="stage.status === 'abandoned'"
                    >
                        已废弃
                    </el-tag>
                    <el-tag
                        size="mini"
                        style="margin-left: 4px"
                        type="danger"
                        v-if="stage.status === 'rejected'"
                    >
                        审核驳回
                    </el-tag>
                    <el-tag
                        size="mini"
                        style="margin-left: 4px"
                        type="warning"
                        v-if="stage.status === 'underApprove'"
                    >
                        审核中
                    </el-tag>
                    <el-tag size="mini" style="margin-left: 4px" v-if="stage.isPublic">
                        已公开
                    </el-tag>

                    <el-button style="margin-left: auto" icon="el-icon-view" @click="toView">
                        详情
                    </el-button>
                </div>
                <div class="author-area">
                    <div v-for="user of stage.authorUID" :key="user._id">
                        <div class="author">
                            <el-popover
                                placement="left"
                                trigger="hover"
                                :open-delay="200"
                                width="360"
                                @show="showUpPopoverKey = user._id"
                            >
                                <div>
                                    <profile-popover
                                        :uid="user._id"
                                        :show-up-popover-key="showUpPopoverKey"
                                    />
                                </div>
                                <span slot="reference">
                                    <el-avatar
                                        :size="24"
                                        :src="avatarPath + user.avatar"
                                    ></el-avatar>
                                </span>
                            </el-popover>
                        </div>
                    </div>
                </div>
            </el-col>
        </el-row>
        <div class="container">
            <el-row>
                <el-col :span="16" :offset="4">
                    <el-form label-positoin="left" label-width="80px">
                        <el-form-item label="阶段名">
                            <el-input
                                v-model="stage.subjectName"
                                placeholder="阶段名"
                                :disabled="!stage.editable"
                            />
                        </el-form-item>
                        <el-form-item label="摘要">
                            <el-input
                                v-model="stage.sketch"
                                type="textarea"
                                :autosize="{ minRows: 2 }"
                                placeholder="摘要"
                                :disabled="!stage.editable"
                            />
                        </el-form-item>
                        <el-form-item>
                            <el-button
                                type="primary"
                                @click="saveInfo"
                                :loading="infoSaving"
                                v-if="stage.editable"
                            >
                                更新
                            </el-button>
                        </el-form-item>
                        <br />
                        <el-form-item>
                            <div style="border: 1px solid #e4e7ed; border-radius: 6px">
                                <div class="item">
                                    <div class="text">
                                        <div class="title">查看记录</div>
                                        <div class="info">查看本阶段的所有操作记录</div>
                                    </div>
                                    <div class="button">
                                        <el-button type="primary" @click="viewEditlog">
                                            查看
                                        </el-button>
                                    </div>
                                </div>
                            </div>
                        </el-form-item>
                        <br />
                        <el-form-item>
                            <div class="danger-zone">
                                <div class="item">
                                    <div class="text">
                                        <div class="title">公开本阶段</div>
                                        <div class="info">
                                            将本阶段公开至公共区域，本课程的其他师生可以查看并给出建议。公开后本阶段内容将不可修改。
                                        </div>
                                    </div>
                                    <div class="button">
                                        <el-button
                                            type="primary"
                                            plain
                                            @click="handleDangerOperation('public')"
                                            :disabled="
                                                stage.isPublic || stage.status === 'abandoned'
                                            "
                                        >
                                            公开
                                        </el-button>
                                    </div>
                                </div>

                                <div class="item" v-if="stage.isNeedApprove">
                                    <div class="text">
                                        <div class="title">提交审批</div>
                                        <div class="info">
                                            将本阶段提交审批。提交后本阶段内容不可修改，审批中无法废弃本阶段，无法新建阶段。只有最新阶段可以提交审批。
                                        </div>
                                    </div>
                                    <div class="button">
                                        <el-button
                                            type="primary"
                                            plain
                                            @click="handleDangerOperation('approve')"
                                            :disabled="
                                                stage.status !== 'beforeApprove' || !stage.isLast
                                            "
                                        >
                                            提交
                                        </el-button>
                                    </div>
                                </div>
                                <div class="item">
                                    <div class="text">
                                        <div class="title">废弃</div>
                                        <div class="info">
                                            将本阶段废弃。废弃后的阶段依然会显示在时间轴上。
                                        </div>
                                    </div>
                                    <div class="button">
                                        <el-button
                                            type="danger"
                                            plain
                                            @click="handleDangerOperation('abandon')"
                                            :disabled="
                                                stage.status === 'abandoned' ||
                                                stage.status === 'underApprove'
                                            "
                                        >
                                            废弃
                                        </el-button>
                                    </div>
                                </div>
                            </div>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
        <el-dialog title="操作记录" :visible.sync="operationDialogVisible">
            <div class="container">
                <el-timeline v-loading="editlogLoading">
                    <el-timeline-item
                        v-for="(log, index) in stage.editLog"
                        :key="index"
                        :timestamp="normalFormatTime(new Date(log.time), '{y}-{m}-{d} {h}:{i}')"
                        placement="top"
                    >
                        {{ log.operation }} - {{ log.uid.name }}
                    </el-timeline-item>
                </el-timeline>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {
    getStageInfo,
    manageSaveInfo,
    getEditLog,
    submitDangerOperation,
} from "@/api/timeline-project"
import ProfilePopover from "@/components/ProfilePopover/profile-popover.vue"
import { normalFormatTime } from "@/utils/index.js"

export default {
    name: "StageManage",
    components: { ProfilePopover },

    data() {
        return {
            stageID: this.$route.params.id,
            stage: {},
            loading: true,
            avatarPath: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            showUpPopoverKey: "",
            infoSaving: false,
            operationDialogVisible: false,
            editlogLoading: false,
        }
    },
    filters: {
        subjectNameFilter: val => {
            return val || "暂无阶段名"
        },
    },
    created() {
        this.getStageInfo()
    },
    methods: {
        normalFormatTime,
        toView() {
            this.$router.push("/course/section/activity/timeline/private/view/" + this.stageID)
        },
        getStageInfo() {
            let { stageID } = this
            this.loading = true
            getStageInfo({ stageID })
                .then(res => {
                    this.stage = res.data

                    this.loading = false
                })
                .catch()
        },
        saveInfo() {
            this.infoSaving = true
            this.stage.subjectName = this.stage.subjectName.trim()
            let { stageID } = this
            let { subjectName, sketch } = this.stage
            subjectName = subjectName || ""
            sketch = sketch || ""
            manageSaveInfo({ subjectName, sketch, stageID })
                .then(() => {
                    this.$message.success("更新成功")
                    this.infoSaving = false
                    this.getStageInfo()
                })
                .catch(() => {
                    this.infoSaving = false
                })
        },
        viewEditlog() {
            this.operationDialogVisible = true
            let { editLog } = this.stage
            if (editLog) {
                return
            }
            let { stageID } = this

            this.editlogLoading = true
            getEditLog({ stageID })
                .then(res => {
                    this.stage.editLog = res.data
                    this.editlogLoading = false
                })
                .catch()
        },
        handleDangerOperation(type) {
            let tip = {
                public: "确定将本阶段公开？",
                approve: "确定将本阶段提交审核？",
                abandon: "确定废弃本阶段？",
            }
            let message = tip[type] || "error"
            this.$confirm(message, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                beforeClose: (action, instance, done) => {
                    if (action === "confirm") {
                        instance.confirmButtonLoading = true
                        let { stageID } = this
                        submitDangerOperation({ stageID, type })
                            .then(() => {
                                this.$message.success("操作成功")
                                instance.confirmButtonLoading = false
                                this.getStageInfo()
                                done()
                            })
                            .catch(() => {
                                instance.confirmButtonLoading = false
                            })
                    } else {
                        done()
                    }
                },
            }).catch(() => {})
        },
    },
}
</script>

<style lang='scss' scoped>
.subtitle {
    // background-color: rgb(245, 245, 246);
    border-bottom: solid 1px #e4e7ed;
    .subject-name {
        align-items: center;
        display: flex;
        font-size: 22px;
        color: #303133;
        padding: 30px 40px 10px 40px;
    }
    .author-area {
        align-items: center;
        display: flex;
        font-size: 22px;
        color: #303133;
        padding: 10px 40px 20px 40px;
    }
}

.author-area {
    align-items: center;
    display: flex;
    font-size: 22px;
    color: #303133;
    padding: 10px 40px 20px 40px;
}

.author {
    margin-right: 6px;
}

.container {
    padding: 40px;
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
