<template>
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
                        <span v-else key="editProjectName">
                            <el-input v-model="editData.name" placeholder="项目名称" />
                        </span>
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
                    </div>
                </el-card>
            </el-col>
            <el-col :span="19">
                <el-timeline>
                    <el-timeline-item
                        v-for="e of project.timeline"
                        :timestamp="normalFormatTime(new Date(e.createTime), '{y}-{m}-{d} {h}:{i}')"
                        placement="top"
                        :key="e._id"
                        :color="e.status | timelineColorFilter"
                    >
                        <el-card>
                            <div class="subjuct-name" slot="header">
                                {{ e.subjectName | subjectNameFilter }}
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
                                    type="danger"
                                    v-if="e.status === 'rejected'"
                                >
                                    审核驳回
                                </el-tag>
                            </div>
                            <div class="content-preview">{{ e.sketch | sketchFilter }}</div>
                        </el-card>
                    </el-timeline-item>
                    <el-timeline-item
                        :timestamp="normalFormatTime(new Date(), '{y}-{m}-{d} {h}:{i}')"
                        placement="top"
                    >
                        <el-card>
                            <div class="timeline-wrapper">
                                <div class="create-timeline-item-wrapper">
                                    <el-button type="text" icon="el-icon-plus">
                                        <!--全新or选择已有阶段继承-->
                                        建立新的阶段
                                    </el-button>
                                    <el-tooltip
                                        content="注意：新建阶段或公开阶段后，已有阶段不可编辑"
                                        placement="right"
                                        effect="light"
                                    >
                                        <i
                                            class="el-icon-warning-outline"
                                            style="margin-left: 8px; color: #606266"
                                        />
                                    </el-tooltip>
                                </div>
                            </div>
                        </el-card>
                    </el-timeline-item>
                </el-timeline>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { submitEditIntro } from "@/api/timeline-project"
import { normalFormatTime } from "@/utils/index.js"
export default {
    props: ["project"],
    filters: {
        noIntro: function (val) {
            if (!val) {
                return "暂无简介"
            }
            return val
        },
        tagTypeFilter: function (val) {
            let map = {
                approve: "warning",
                normal: "",
                conclude: "success",
                rejected: "danger",
            }
            return map[val] || ""
        },
        statusFilter: val => {
            let map = {
                approve: "待审核",
                normal: "行进中",
                conclude: "结题",
            }
            return map[val] || ""
        },
        timelineColorFilter: val => {
            let map = {
                approve: "#E6A23C",
                normal: "#409EFF",
                conclude: "#67C23A",
                rejected: "#F56C6C",
            }
            return map[val] || ""
        },
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
    },
}
</script>

<style lang='scss' >
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
.timeline-wrapper {
    height: 86px;

    .create-timeline-item-wrapper {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
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
</style>
