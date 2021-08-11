<template>
    <div class="container" v-loading="loading" element-loading-text="加载中">
        <el-row>
            <el-col :span="16" :offset="4">
                <el-form>
                    <el-form-item>
                        <div class="subject-name">
                            {{ stage.subjectName | subjectNameFilter }}
                            <el-tag
                                size="mini"
                                style="margin-left: 4px"
                                :type="stage.status | tagTypeFilter"
                            >
                                {{ stage.status | statusFilter }}
                            </el-tag>
                        </div>
                    </el-form-item>
                    <span v-if="stage.editable">
                        <el-form-item>
                            <el-input v-model="stage.subjectName" placeholder="阶段名" />
                        </el-form-item>
                        <el-form-item>
                            <el-input
                                v-model="stage.sketch"
                                type="textarea"
                                :autosize="{ minRows: 2 }"
                                placeholder="摘要"
                            />
                        </el-form-item>
                        <el-form-item v-if="stage._id">
                            <!--frola-->
                            <editor
                                :exist-content="stage.content"
                                ref="editor"
                                :min-height="480"
                                :stage-id="stageID"
                            />
                        </el-form-item>

                        <el-form-item style="width: 100%">
                            <upload-file
                                action="#"
                                drag
                                multiple
                                :on-preview="download"
                                :on-remove="handleRemove"
                                :on-success="handleSuccess"
                                ref="uploadFile"
                            >
                                <i class="el-icon-upload"></i>
                                <div class="el-upload__text">
                                    将文件拖到此处，或
                                    <em>点击上传</em>
                                </div>
                            </upload-file>
                        </el-form-item>
                        <!--TODO:保存按钮，提交审核按钮-->
                        <el-form-item>
                            <el-button type="primary">保存</el-button>
                            <el-button
                                type="primary"
                                icon="el-icon-s-promotion"
                                v-if="stage.status === 'beforeApprove'"
                            >
                                提交审批
                            </el-button>
                        </el-form-item>
                    </span>
                    <span v-else>
                        <el-form-item>
                            <div class="sketch">
                                {{ stage.sketch }}
                            </div>
                        </el-form-item>
                        <el-form-item v-if="stage._id">
                            <editor-viewer :content="stage.content"></editor-viewer>
                        </el-form-item>
                        <el-form-item>
                            <!--文件列表-->
                        </el-form-item>
                    </span>
                </el-form>
            </el-col>
        </el-row>
        <el-divider />
        <!--TODO:发言评论组件-->
    </div>
</template>

<script>
import { getStage } from "@/api/timeline-project"
import Editor from "@/components/Editor"
import EditorViewer from "@/components/EditorViewer"
import uploadFile from "@/components/UploadFile"
import download from "@/utils/download"
import { tagTypeFilter, statusFilter } from "@/utils/timelineFilters"

export default {
    name: "TimeLineStage",
    components: { Editor, uploadFile, EditorViewer },
    filters: {
        subjectNameFilter: val => {
            return val || "暂无阶段名"
        },
        tagTypeFilter,
        statusFilter,
    },
    data() {
        return {
            stageID: this.$route.params.id,
            loading: false,
            stage: {},
        }
    },
    created() {
        this.getStage()
    },
    //提交时，等待0.8秒再发送，防止手太快内容没同步
    methods: {
        getStage() {
            let { stageID } = this
            this.loading = true
            getStage({ stageID })
                .then(res => {
                    this.stage = res.data
                    this.loading = false
                })
                .catch()
        },
        contentChange(val) {
            console.log(val)
            this.stage.content = val
        },
        download(file) {
            download(file.response._id)
        },
        handleRemove(file, fileList) {
            this.files = fileList
        },
        handleSuccess(response, file, fileList) {
            this.files = fileList
        },
    },
}
</script>

<style lang="scss" scoped>
.container {
    min-height: 80vh;
    padding: 40px;

    .subject-name {
        font-size: 22px;
        color: #303133;
    }

    .sketch {
        font-size: 14px;
        margin-bottom: 30px;
        border-left: 2px solid #cccccc;
        padding-left: 8px;
    }
}
</style>
<style lang='scss' >
.el-upload {
    width: 100%;
    .el-upload-dragger {
        width: 100%;
    }
}
</style>

