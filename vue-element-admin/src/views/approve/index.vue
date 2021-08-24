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
                    <el-divider />

                    <el-form-item>
                        <el-radio-group>
                            <el-radio :label="3">通过</el-radio>
                            <el-radio :label="6">驳回</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item>
                        <el-input type="textarea" :autosize="{ minRows: 3 }" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { getProjectUnderApproveStage } from "@/api/activityManage"
import { noIntro, tagTypeFilter, statusFilter, stageColorFilter } from "@/utils/timelineFilters"
import ProfilePopover from "@/components/ProfilePopover/profile-popover.vue"
import EditorViewer from "@/components/EditorViewer"
import download from "@/utils/download"
import { fileType, fileIcon } from "@/utils/fileType"

export default {
    name: "Approve",
    components: { ProfilePopover, EditorViewer },
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
            showUpPopoverKey: "",
            avatarPath: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            loading: false,
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
                    let { project, stage, approvement } = res.data
                    this.project = project
                    this.stage = stage
                    this.approvement = approvement
                    this.loading = false
                })
                .catch(err => console.log(err))
        },
        download(_id) {
            download(_id)
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
</style>
