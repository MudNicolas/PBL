<template>
    <div class="container" v-loading="loading">
        <el-row :gutter="30">
            <el-col :span="5">
                <el-card>
                    <div slot="header" class="clearfix">
                        <span style="display: flex; align-items: center">
                            {{ project.name }}
                            <el-tag
                                size="mini"
                                style="margin-left: 4px"
                                :type="project.status | tagTypeFilter"
                            >
                                {{ project.status | statusFilter }}
                            </el-tag>
                        </span>
                    </div>
                    <div class="intro">
                        <div key="intro" class="text">
                            {{ project.intro | noIntro }}
                            <div class="author-area">
                                <div v-for="user of project.authors" :key="user._id">
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
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="18">
                <el-form>
                    <el-form-item>
                        <div class="subject-name">
                            {{ stage.subjectName | subjectNameFilter }}
                            <el-tag
                                size="mini"
                                style="margin-left: 4px"
                                type="success"
                                v-if="stage.status === 'approved'"
                            >
                                审核通过
                            </el-tag>
                            <el-tag
                                size="mini"
                                style="margin-left: 4px"
                                type="danger"
                                v-if="stage.status === 'rejected'"
                            >
                                审核驳回
                            </el-tag>
                        </div>
                        <div class="sketch">
                            {{ stage.sketch }}
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <editor-viewer :content="stage.content"></editor-viewer>
                    </el-form-item>
                    <el-form-item>
                        <el-table
                            v-if="stage.files.length > 0"
                            :data="stage.files"
                            border
                            style="width: 100%"
                        >
                            <el-table-column prop="originalFilename" label="文件">
                                <template slot-scope="scope">
                                    <div class="content">
                                        <span @click="download(scope.row._id)">
                                            <svg-icon
                                                :icon-class="scope.row.originalFilename | fileIcon"
                                            />
                                            {{ scope.row.originalFilename }}
                                        </span>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="originalFilename" label="格式">
                                <template slot-scope="scope">
                                    <div class="content">
                                        {{ scope.row.originalFilename | fileType }}
                                    </div>
                                </template>
                            </el-table-column>

                            <el-table-column prop="size" label="大小">
                                <template slot-scope="scope">
                                    <div class="content">
                                        {{ scope.row.size | fileSize }}
                                    </div>
                                </template>
                            </el-table-column>

                            <el-table-column prop="operation" label="操作">
                                <template slot-scope="scope">
                                    <el-button
                                        type="text"
                                        icon="el-icon-download"
                                        @click="download(scope.row._id)"
                                    >
                                        下载
                                    </el-button>

                                    <slot name="fileOperation" :row="scope.row"></slot>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-form-item>
                    <el-form-item></el-form-item>
                    <el-divider />
                    <span v-if="!approvement._id">
                        <el-form-item>
                            <el-radio-group v-model="approvement.status">
                                <el-radio label="approved">通过</el-radio>
                                <el-radio label="rejected">驳回</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item>
                            <el-input
                                type="textarea"
                                :autosize="{ minRows: 3 }"
                                placeholder="审批理由"
                                v-model="approvement.reason"
                            />
                        </el-form-item>
                        <el-form-item>
                            <el-button
                                type="primary"
                                :disabled="!approvement.status"
                                @click="handleSubmit"
                                :loading="submitting"
                            >
                                提交
                            </el-button>
                            <el-button
                                @click="
                                    $router.push(
                                        `/course/section/activity/manage/${activityID}?type=TimeLineProject&tab=approve`
                                    )
                                "
                            >
                                返回
                            </el-button>
                        </el-form-item>
                    </span>
                    <span v-else>
                        <approve-description :approvement="approvement" />
                    </span>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { getProjectUnderApproveStage, submitApprovement } from "@/api/activityManage"
import { noIntro, tagTypeFilter, statusFilter, stageColorFilter } from "@/utils/timelineFilters"
import ProfilePopover from "@/components/ProfilePopover/profile-popover.vue"
import EditorViewer from "@/components/EditorViewer"
import download from "@/utils/download"
import { fileType, fileIcon } from "@/utils/fileType"
import ApproveDescription from "@/components/ApproveDescription"

export default {
    name: "Approve",
    components: { ProfilePopover, EditorViewer, ApproveDescription },
    filters: {
        noIntro,
        tagTypeFilter,
        statusFilter,
        stageColorFilter,
        subjectNameFilter: val => {
            return val || "暂无阶段名"
        },
        sketchFilter: val => {
            return val || "暂无简述"
        },
        fileType,
        fileIcon,
        fileSize: function (val) {
            if (val < 1024) {
                return `${Math.round(val)}B`
            }
            if (val < 1024 * 1024) {
                return `${Math.round(val / 1024)}KB`
            }
            if (val < 1024 * 1024 * 1024) {
                return `${Math.round(val / 1024 / 1024)}MB`
            }
            return `${Math.round(val / 1024 / 1024 / 1024)}GB`
        },
    },
    data() {
        return {
            project: {
                name: "",
                status: "",
                intro: "",
            },
            stage: {
                files: [],
            },
            activityID: "",
            approvement: {
                status: "",
                reason: "",
            },
            showUpPopoverKey: "",
            avatarPath: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            loading: false,
            submitting: false,
            stageID: this.$route.params.id,
        }
    },
    created() {
        this.getProjectUnderApproveStage()
    },
    methods: {
        getProjectUnderApproveStage() {
            this.loading = true
            let { stageID } = this
            getProjectUnderApproveStage({ stageID })
                .then(res => {
                    let { project, stage, approvement, activityID } = res.data
                    this.project = project
                    this.stage = stage
                    this.approvement = approvement || {
                        status: "",
                        reason: "",
                    }
                    this.activityID = activityID
                    this.loading = false
                })
                .catch(err => console.log(err))
        },
        download(_id) {
            download(_id)
        },
        handleSubmit() {
            let { approvement } = this
            if (!approvement.status) {
                return
            }
            this.submitting = true
            let { stageID } = this
            submitApprovement({ stageID, approvement })
                .then(() => {
                    this.$message.success("提交成功")
                    this.getProjectUnderApproveStage()
                })
                .catch(err => {
                    console.log(err)
                    this.submitting = false
                })
        },
    },
}
</script>

<style lang="scss" scoped>
.container {
    padding: 30px;
}
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

.container {
    min-height: 80vh;
    padding: 40px;

    .subject-name {
        align-items: center;
        display: flex;
        font-size: 22px;
        color: #303133;
        margin-bottom: 10px;
    }

    .sketch {
        font-size: 14px;
        line-height: 18px;
        border-left: 2px solid #cccccc;
        padding-left: 8px;
        color: #606266;
        margin-bottom: 12px;
    }
}
.author {
    margin-right: 6px;
}
.clearfix {
    font-size: 20px;
    display: flex;
    align-items: center;
    color: #303133;
}
.intro {
    font-size: 14px;
    margin-bottom: 12px;
    color: #606266;

    .text {
        line-height: 1.5;
    }
}
.stage-wrapper {
    height: 86px;

    .create-stage-card-wrapper {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #909399;

        i {
            margin-left: 8px;
        }
    }
}

.author-area {
    display: flex;
    margin-top: 12px;

    .author {
        margin-right: 6px;
    }
}
</style>
