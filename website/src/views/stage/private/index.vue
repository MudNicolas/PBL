<template>
    <div>
        <el-row class="subtitle">
            <el-col :span="18" :offset="3">
                <div class="subject-name">
                    {{ stage.subjectName | subjectNameFilter }}
                    <status-tag :status="stage.status" />
                    <el-tag size="mini" style="margin-left: 4px" v-if="stage.isPublic">
                        已公开
                    </el-tag>

                    <el-button
                        v-if="checkPermission(['student'])"
                        style="margin-left: auto"
                        icon="el-icon-s-tools"
                        @click="toManage"
                    >
                        管理
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

        <div class="container" v-loading="loading" element-loading-text="加载中">
            <el-row>
                <el-col :span="18" :offset="3">
                    <el-form>
                        <span v-if="stage.editable && !preview && checkPermission(['student'])">
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
                                    :autosave-position="{ stageID }"
                                    :autosave-path="autosavePath"
                                    :image-upload-path="imageUploadPath"
                                    :video-upload-path="videoUploadPath"
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
                                                <svg-icon :icon-class="scope.row.name | fileIcon" />
                                                {{ scope.row.name }}
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
                        <el-form-item v-if="stage.editable && checkPermission(['student'])">
                            <el-button type="primary" @click="togglePreviewPage">
                                {{ previewButtonText }}
                            </el-button>

                            <el-button type="primary" @click="handleSave" :loading="saving">
                                保存
                            </el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row style="margin-top: 20px" v-if="stage.approvement">
                <el-col :span="18" :offset="3">
                    <el-divider />
                    <approve-description :approvement="stage.approvement" />
                </el-col>
            </el-row>
            <el-row style="margin-top: 20px">
                <el-col :span="18" :offset="3">
                    <el-divider />

                    <div id="commentList">
                        <el-skeleton
                            :rows="6"
                            animated
                            :loading="commentsLoading"
                            :count="3"
                            :throttle="300"
                        >
                            <template slot="template">
                                <div
                                    style="display: flex; align-items: center; margin-bottom: 16px"
                                >
                                    <el-skeleton-item variant="circle" />
                                    <el-skeleton-item
                                        variant="h3"
                                        style="width: 20%; margin-left: 10px"
                                    />
                                </div>
                                <el-skeleton-item
                                    variant="rect"
                                    style="margin-left: 47px; margin-bottom: 16px"
                                />
                                <el-skeleton-item
                                    variant="rect"
                                    style="margin-left: 47px; margin-bottom: 16px"
                                />
                                <el-skeleton-item
                                    variant="rect"
                                    style="margin-left: 47px; margin-bottom: 16px; width: 66%"
                                />
                            </template>
                            <slot>
                                <comment
                                    :comments-data="commentsData"
                                    ref="comment"
                                    @reloadComments="getComments"
                                    v-if="commentsData.comments"
                                    :position="{ stageID, name: 'stageID' }"
                                    :commentable="!stage.timeout"
                                />
                            </slot>
                        </el-skeleton>
                    </div>
                </el-col>
            </el-row>
            <el-backtop></el-backtop>
        </div>
    </div>
</template>

<script>
import { getStage, saveStage } from "@/api/timeline-project"
import { getComments } from "@/api/comments"
import Editor from "@/components/Editor"
import EditorViewer from "@/components/EditorViewer"
import uploadFile from "@/components/UploadFile"
import download from "@/utils/download"
import { fileType, fileIcon } from "@/utils/fileType"
import Comment from "@/components/Comment"
import ProfilePopover from "@/components/ProfilePopover/profile-popover.vue"
import StatusTag from "@/components/StatusTag"
import { statusFilter } from "@/utils/timelineFilters"
import { normalFormatTime } from "@/utils/index.js"
import ApproveDescription from "@/components/ApproveDescription"
import checkPermission from "@/utils/permission" // 权限判断函数

export default {
    name: "TimeLineStage",
    components: {
        Editor,
        uploadFile,
        EditorViewer,
        Comment,
        ProfilePopover,
        StatusTag,
        ApproveDescription,
    },
    filters: {
        statusFilter,
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
        let stageID = this.$route.params.id
        return {
            stageID,
            loading: false,
            stage: {
                subjectName: "",
                sketch: "",
                content: "",
                files: [],
            },
            commentsData: {},
            commentsLoading: true,
            saving: false,
            preview: false,
            previewButtonText: "预览",
            avatarPath: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            showUpPopoverKey: "",
            imageUploadPath:
                process.env.VUE_APP_BASE_API +
                "/activity/view/timeline/private/stage/editor/image/upload?stageID=" +
                stageID,
            videoUploadPath:
                process.env.VUE_APP_BASE_API +
                "/activity/view/timeline/private/stage/editor/video/upload?stageID=" +
                stageID,
            autosavePath: "/activity/view/timeline/private/stage/editor/autosave",
        }
    },
    created() {
        this.getStage()
    },
    methods: {
        normalFormatTime,
        checkPermission,
        getStage() {
            let { stageID } = this
            this.loading = true
            getStage({ stageID })
                .then(res => {
                    this.stage = res.data
                    if (this.stage.isSaved && !this.preview) {
                        this.togglePreview()
                    }
                    this.loading = false
                    let io = new IntersectionObserver(
                        ([{ boundingClientRect, intersectionRatio }]) => {
                            if (intersectionRatio <= 0) {
                                return false
                            }
                            this.getComments()
                            io.disconnect()
                        }
                    )
                    // 6. 获取被监听元素
                    let commentList = document.getElementById("commentList")
                    // 7. 在观察对象上，监听 6 中获取的对象
                    io.observe(commentList)
                })
                .catch()
        },
        getComments() {
            let { stageID } = this
            this.commentsLoading = true
            let type = "private"
            getComments({ stageID, type })
                .then(res => {
                    this.commentsData = res.data
                    this.commentsLoading = false
                })
                .catch()
        },
        toManage() {
            this.$router.push(
                "/course/section/activity/timeline/private/stage/manage/" + this.stageID
            )
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
        getContent() {
            this.stage.content = this.$refs.Editor.editor.html.get()
        },
        togglePreview() {
            this.preview = !this.preview

            this.previewButtonText = this.preview ? "编辑" : "预览"
        },
        togglePreviewPage() {
            if (!this.preview) {
                this.getContent()
            }
            this.togglePreview()
        },
        handleSave() {
            this.saving = true
            this.stage.subjectName = this.stage.subjectName.trim()
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
<style lang='scss' >
.el-upload {
    width: 100%;
    .el-upload-dragger {
        width: 100%;
    }
}
</style>

