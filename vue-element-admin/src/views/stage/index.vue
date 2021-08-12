<template>
    <div class="container" v-loading="loading" element-loading-text="加载中">
        <el-row>
            <el-col :span="18" :offset="3">
                <el-form>
                    <el-form-item>
                        <div class="subject-name">
                            {{ stage.subjectName | subjectNameFilter }}
                        </div>
                    </el-form-item>
                    <span v-if="stage.editable && !preview">
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
                                ref="Editor"
                                :min-height="480"
                                :stage-id="stageID"
                            />
                        </el-form-item>

                        <el-form-item style="width: 100%">
                            <upload-file
                                action="#"
                                drag
                                multiple
                                :file-list="stage.files"
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
                    </span>

                    <span v-show="!stage.editable || preview">
                        <el-form-item>
                            <div class="sketch">
                                {{ stage.sketch }}
                            </div>
                        </el-form-item>
                        <el-form-item v-if="stage._id">
                            <editor-viewer :content="stage.content"></editor-viewer>
                        </el-form-item>
                        <el-form-item>
                            <el-table
                                v-if="stage.files.length > 0"
                                :data="stage.files"
                                border
                                style="width: 100%"
                            >
                                <el-table-column prop="name" label="文件">
                                    <template slot-scope="scope">
                                        <div class="content">
                                            <span @click="download(scope.row._id)">
                                                <svg-icon :icon-class="scope.row.name | fileIcon" />
                                                {{ scope.row.name }}
                                            </span>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="name" label="格式">
                                    <template slot-scope="scope">
                                        <div class="content">
                                            {{ scope.row.name | fileType }}
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
                                            @click="download(scope.row)"
                                        >
                                            下载
                                        </el-button>

                                        <slot name="fileOperation" :row="scope.row"></slot>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-form-item>
                    </span>
                    <el-form-item v-if="stage.editable">
                        <el-button type="primary" @click="togglePreview">
                            {{ previewButtonText }}
                        </el-button>

                        <el-button type="primary" @click="handleSave" :loading="saving">
                            保存
                        </el-button>
                        <!--TODO:审批按钮放管理页面-->
                        <el-button
                            type="primary"
                            icon="el-icon-s-promotion"
                            v-if="stage.status === 'beforeApprove'"
                        >
                            提交审批
                        </el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <el-divider />
        <!--TODO:发言评论组件-->
    </div>
</template>

<script>
import { getStage, saveStage } from "@/api/timeline-project"
import Editor from "@/components/Editor"
import EditorViewer from "@/components/EditorViewer"
import uploadFile from "@/components/UploadFile"
import download from "@/utils/download"
import { fileType, fileIcon } from "@/utils/fileType"

export default {
    name: "TimeLineStage",
    components: { Editor, uploadFile, EditorViewer },
    filters: {
        subjectNameFilter: val => {
            return val || "暂无阶段名"
        },
        fileType: val => {
            return fileType(val)
        },
        fileIcon: val => {
            return fileIcon(val)
        },
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
            stageID: this.$route.params.id,
            loading: false,
            stage: {
                subjectName: "",
                sketch: "",
                content: "",
                files: [],
            },

            saving: false,
            preview: false,
            previewButtonText: "预览",
        }
    },
    created() {
        this.getStage()
    },
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

        download(file) {
            download(file.response._id)
        },
        handleRemove(file, fileList) {
            this.stage.files = fileList
        },
        handleSuccess(response, file, fileList) {
            this.stage.files = fileList
        },
        togglePreview() {
            if (!this.preview) {
                this.stage.content = this.$refs.Editor.editor.html.get()
            }
            this.preview = !this.preview

            this.previewButtonText = this.preview ? "编辑" : "预览"
        },
        handleSave() {
            this.saving = true
            let { subjectName, sketch } = this.stage
            subjectName = subjectName || ""
            sketch = sketch || ""
            let content = this.$refs.Editor
                ? this.$refs.Editor.editor.html.get()
                : this.stage.content
            let files = this.stage.files.map(e => {
                return e.response._id
            })
            let stageData = { subjectName, sketch, content, files }
            let { stageID } = this
            saveStage({ stageData, stageID })
                .then(() => {
                    this.saving = false
                    this.$message.success("保存成功")
                    this.getStage()
                    if (!this.preview) {
                        this.togglePreview()
                    }
                })
                .catch(() => {
                    this.saving = false
                })
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
        line-height: 18px;
        border-left: 2px solid #cccccc;
        padding-left: 8px;
        color: #606266;
        margin-bottom: 12px;
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

