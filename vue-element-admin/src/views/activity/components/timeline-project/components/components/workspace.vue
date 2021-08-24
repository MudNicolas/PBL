<template>
    <!--TODO:教师能够从管理页面访问private-->
    <div>
        <el-row>
            <el-col :span="5">
                <el-card>
                    <div slot="header" class="clearfix">
                        <span v-if="!isIntroEdit" style="display: flex; align-items: center">
                            {{ project.name }}
                            <el-tag
                                size="mini"
                                style="margin-left: 4px"
                                :type="project.status | tagTypeFilter"
                            >
                                {{ project.status | statusFilter }}
                            </el-tag>
                        </span>
                        <span v-if="private" style="margin-left: auto; padding-left: 6px">
                            <span v-if="isIntroEdit" key="editProjectName">
                                <el-input v-model="editData.name" placeholder="项目名称" />
                            </span>
                            <el-button type="text" @click="handleEditButtonClick">
                                <span v-if="!isIntroEdit">编辑</span>
                                <span v-else key="cancel">取消</span>
                            </el-button>
                        </span>
                    </div>
                    <div class="intro">
                        <div v-if="isIntroEdit && private">
                            <el-form>
                                <el-form-item>
                                    <el-input
                                        v-model="editData.intro"
                                        type="textarea"
                                        autosize
                                        placeholder="项目简述"
                                    />
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
                        <div v-else key="intro" class="text" @dblclick="handleEditButtonClick">
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
            <el-col :span="19">
                <el-timeline>
                    <el-timeline-item
                        v-for="e of stages"
                        :timestamp="normalFormatTime(new Date(e.createTime), '{y}-{m}-{d} {h}:{i}')"
                        placement="top"
                        :key="e._id"
                        :color="e.status | stageColorFilter"
                    >
                        <el-card>
                            <div class="subjuct-name" slot="header">
                                <router-link
                                    :to="
                                        private
                                            ? `/course/section/activity/timeline/private/stage/view/${e._id}`
                                            : `/course/section/activity/timeline/public/stage/view/${e._id}`
                                    "
                                >
                                    {{ e.subjectName | subjectNameFilter }}
                                </router-link>
                                <el-tag
                                    size="mini"
                                    style="margin-left: 4px"
                                    type="info"
                                    v-if="e.status === 'abandoned'"
                                >
                                    已废弃
                                </el-tag>
                                <el-tag
                                    size="mini"
                                    style="margin-left: 4px"
                                    type="success"
                                    v-if="e.status === 'approved'"
                                >
                                    审核通过
                                </el-tag>
                                <el-tag
                                    size="mini"
                                    style="margin-left: 4px"
                                    type="danger"
                                    v-if="e.status === 'rejected'"
                                >
                                    审核驳回
                                </el-tag>
                                <el-tag
                                    size="mini"
                                    style="margin-left: 4px"
                                    type="warning"
                                    v-if="e.status === 'underApprove'"
                                >
                                    审核中
                                </el-tag>
                                <el-tag size="mini" style="margin-left: 4px" v-if="e.isPublic">
                                    已公开
                                </el-tag>
                            </div>
                            <div class="content-preview">{{ e.sketch | sketchFilter }}</div>
                        </el-card>
                    </el-timeline-item>

                    <el-timeline-item
                        :timestamp="normalFormatTime(new Date(), '{y}-{m}-{d} {h}:{i}')"
                        placement="top"
                        v-if="private"
                    >
                        <el-card>
                            <div class="stage-wrapper">
                                <div class="create-stage-card-wrapper">
                                    <span v-if="project.timeout">
                                        <i class="el-icon-lock" />
                                        当前已不在限定时间内
                                    </span>
                                    <span v-else>
                                        <span v-if="project.status !== 'underApprove'">
                                            <el-button
                                                type="text"
                                                icon="el-icon-plus"
                                                @click="newStageDialogVisible = true"
                                            >
                                                <!--全新or选择已有阶段继承-->
                                                建立新的阶段
                                            </el-button>
                                            <el-tooltip
                                                content="注意：新建阶段或公开阶段后，已有阶段不可编辑"
                                                placement="right"
                                                effect="light"
                                            >
                                                <i class="el-icon-warning-outline" />
                                            </el-tooltip>
                                        </span>
                                        <span v-if="project.status === 'underApprove'">
                                            <i class="el-icon-s-check" />
                                            审批期间无法新建阶段，请等待审批完成
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </el-card>
                    </el-timeline-item>
                </el-timeline>
            </el-col>
        </el-row>
        <el-dialog title="建立新阶段" :visible.sync="newStageDialogVisible">
            <div>
                <el-form>
                    <el-form-item>
                        <el-row :gutter="12">
                            <el-col :span="12">
                                <span @click="chooseStageType('blank')" style="cursor: pointer">
                                    <span
                                        class="corner-mark"
                                        v-if="newStageData.creatMethod === 'blank'"
                                    ></span>
                                    <el-card shadow="hover">
                                        <div
                                            class="stage-choice-card"
                                            :style="{
                                                transform:
                                                    newStageData.creatMethod === 'blank'
                                                        ? 'scale(1.0681818182)'
                                                        : '',
                                            }"
                                        >
                                            <i
                                                class="el-icon-circle-plus-outline"
                                                :style="{
                                                    color:
                                                        newStageData.creatMethod === 'blank'
                                                            ? '#67c23a'
                                                            : '',
                                                }"
                                            />
                                            <div class="tip">建立空白阶段</div>
                                        </div>
                                    </el-card>
                                </span>
                            </el-col>
                            <el-col :span="12">
                                <span
                                    @click="chooseStageType('inheritance')"
                                    style="cursor: pointer"
                                >
                                    <span
                                        class="corner-mark"
                                        v-if="newStageData.creatMethod === 'inheritance'"
                                    ></span>
                                    <el-card shadow="hover">
                                        <div
                                            class="stage-choice-card"
                                            :style="{
                                                transform:
                                                    newStageData.creatMethod === 'inheritance'
                                                        ? 'scale(1.0681818182)'
                                                        : '',
                                            }"
                                        >
                                            <i
                                                class="el-icon-document-copy"
                                                :style="{
                                                    color:
                                                        newStageData.creatMethod === 'inheritance'
                                                            ? '#67c23a'
                                                            : '',
                                                }"
                                            />
                                            <div class="tip">从已有阶段继承</div>
                                        </div>
                                    </el-card>
                                </span>
                            </el-col>
                        </el-row>
                    </el-form-item>
                    <el-form-item v-if="newStageData.creatMethod === 'inheritance'">
                        <el-select
                            v-model="newStageData.inhertStageID"
                            placeholder="请选择将要继承的阶段"
                        >
                            <el-option
                                v-for="item in stages"
                                :key="item._id"
                                :label="item.subjectName || '暂无阶段名'"
                                :value="item._id"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button
                            type="primary"
                            @click="handleCreateStage"
                            :loading="newStageSubmitting"
                        >
                            提交
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { submitEditIntro, newStageSubmit } from "@/api/timeline-project"
import { normalFormatTime } from "@/utils/index.js"
import { noIntro, tagTypeFilter, statusFilter, stageColorFilter } from "@/utils/timelineFilters"
import ProfilePopover from "@/components/ProfilePopover/profile-popover.vue"

export default {
    props: {
        project: Object,
        stages: Array,
        private: Boolean,
    },
    components: { ProfilePopover },
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
    },
    data() {
        return {
            isIntroEdit: false,
            editData: {
                name: "",
                intro: "",
            },
            introEditSubmitting: false,
            newStageDialogVisible: false,
            newStageData: {
                creatMethod: "",
                inhertStageID: "",
            },
            newStageSubmitting: false,
            avatarPath: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            showUpPopoverKey: "",
        }
    },
    methods: {
        handleEditButtonClick() {
            this.isIntroEdit = !this.isIntroEdit
            this.editData.intro = this.project.intro
            this.editData.name = this.project.name
        },
        handleSubmitEditIntro() {
            let projectID = this.project._id
            this.editData.name = this.editData.name.trim()
            let editData = this.editData
            if (!editData.name) {
                this.$message.warning("项目名称不能为空")
                return
            }
            this.introEditSubmitting = true
            submitEditIntro({ projectID, editData })
                .then(() => {
                    this.introEditSubmitting = false
                    this.$message.success("修改成功")
                    this.isIntroEdit = false
                    this.$emit("editIntroSuccess", editData)
                })
                .catch(() => {
                    this.introEditSubmitting = false
                })
        },
        normalFormatTime,
        chooseStageType(method) {
            this.newStageData.creatMethod = method
        },
        handleCreateStage() {
            let data = this.newStageData
            if (!data.creatMethod) {
                this.$message.warning("请选择新建阶段的方式")
                return
            }
            if (data.creatMethod === "inheritance" && !data.inhertStageID) {
                this.$message.warning("请选择将要继承的阶段")
                return
            }
            this.submitNewStage(data)
        },
        submitNewStage(stageOptions) {
            this.newStageSubmitting = true
            let projectID = this.project._id
            newStageSubmit({ projectID, stageOptions })
                .then(res => {
                    this.$message.success("新建阶段成功")
                    this.$router.push(
                        `/course/section/activity/timeline/private/stage/view/${res.data}`
                    )
                })
                .catch(() => {
                    this.newStageSubmitting = false
                })
        },
    },
}
</script>

<style lang='scss' scoped>
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
.content-preview {
    color: #606266;
    //文本超出部分以...形式展示
    text-overflow: -o-ellipsis-lastline;
    //整体超出部分隐藏
    overflow: hidden;
    //文本超出部分以...形式展示，同第一行样式代码
    text-overflow: ellipsis;
    //display 块级元素展示
    display: -webkit-box;
    //设置文本行数为2行
    -webkit-line-clamp: 2;
    //设置文本行数为2行
    line-clamp: 2;
    //从上到下垂直排列子元素（设置伸缩盒子的子元素排列方式）
    -webkit-box-orient: vertical;
}

.subjuct-name {
    font-size: 16px;
    color: #303133;
    display: flex;
    align-items: center;
}

.stage-choice-card {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    transition: all 0.3s;

    i {
        font-size: 48px;
        margin-bottom: 8px;
        color: #606266;
        transition: all 0.3s;
    }

    .tip {
        color: #606266;
    }
}

.corner-mark {
    position: absolute;
    width: 0;
    height: 0;
    border-top: 20px solid #67c23a;
    border-right: 20px solid transparent;
}

.author-area {
    display: flex;
    margin-top: 12px;

    .author {
        margin-right: 6px;
    }
}
</style>
