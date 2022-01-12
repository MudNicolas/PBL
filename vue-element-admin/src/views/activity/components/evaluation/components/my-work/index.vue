<template>
    <div v-loading="loading">
        <div class="container" :class="{ 'teacher-padding': !roles.includes('student') }">
            <!--无组时进入小组活动-->
            <div v-if="status === 'Error'">
                <el-result title="出现了错误" :subTitle="errSubtitle">
                    <template slot="icon"><span style="font-size: 54px">😢</span></template>
                </el-result>
            </div>

            <!--无作品-->
            <div v-if="status === 'NoWork'">
                <el-empty description="暂时没有作品">
                    <el-button type="primary" @click="handleCreateWork" :loading="creating">
                        新建作品
                    </el-button>
                </el-empty>
            </div>

            <!--正常显示作品-->
            <div v-if="status === 'Normal'">
                <div class="container">
                    <el-row>
                        <el-col :span="18" :offset="3">
                            <div>
                                <el-form>
                                    <span v-if="!preview && work.editable">
                                        <el-form-item style="font-size: 12px; color: #b2b2b2">
                                            为
                                            <span v-for="user of work.authors" :key="user._id">
                                                {{ user.name }}
                                            </span>
                                            提交作品
                                        </el-form-item>
                                        <el-form-item>
                                            <el-input
                                                v-model="work.workName"
                                                placeholder="作品名称（必填）"
                                            />
                                        </el-form-item>
                                        <el-form-item>
                                            <el-input
                                                v-model="work.sketch"
                                                type="textarea"
                                                :autosize="{ minRows: 2 }"
                                                placeholder="摘要"
                                            />
                                        </el-form-item>
                                        <el-form-item v-if="work._id">
                                            <!--frola-->
                                            <editor
                                                :exist-content="work.content"
                                                ref="Editor"
                                                :min-height="480"
                                                :autosave-position="{ workID: work._id }"
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
                                                :file-list="work.files"
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

                                    <span v-else>
                                        <work-view :work="work" />
                                    </span>
                                    <el-form-item v-if="work.editable">
                                        <el-button type="primary" @click="togglePreview">
                                            {{ previewButtonText }}
                                        </el-button>
                                        <el-button
                                            type="primary"
                                            @click="handleSubmit"
                                            :loading="saving"
                                        >
                                            保存
                                        </el-button>
                                    </el-form-item>
                                </el-form>
                            </div>
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
                                            style="
                                                display: flex;
                                                align-items: center;
                                                margin-bottom: 16px;
                                            "
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
                                            style="
                                                margin-left: 47px;
                                                margin-bottom: 16px;
                                                width: 66%;
                                            "
                                        />
                                    </template>
                                    <slot>
                                        <comment
                                            :comments-data="commentsData"
                                            ref="comment"
                                            @reloadComments="getComments"
                                            v-if="commentsData.comments"
                                            :position="{ workID }"
                                            :commentable="!work.timeout"
                                        />
                                    </slot>
                                </el-skeleton>
                            </div>
                        </el-col>
                    </el-row>
                    <el-backtop></el-backtop>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex"
import checkPermission from "@/utils/permission" // 权限判断函数
import { getMyWork, createWork, submitWork } from "@/api/evaluation"
import Editor from "@/components/Editor"
import EditorViewer from "@/components/EditorViewer"
import download from "@/utils/download"
import uploadFile from "@/components/UploadFile"
import workView from "../work-view"

export default {
    props: ["activityId"],
    components: {
        Editor,
        EditorViewer,
        download,
        uploadFile,
        workView,
    },

    data() {
        return {
            activityID: "",
            loading: false,
            status: "",
            errSubtitle: "",
            preview: false,
            previewButtonText: "预览",
            work: {},
            saving: false,
            creating: false,
            commentsData: {},
            commentsLoading: true,
            imageUploadPath:
                process.env.VUE_APP_BASE_API +
                "/activity/view/evaluation/work/my/editor/image/upload?workID=",
            videoUploadPath:
                process.env.VUE_APP_BASE_API +
                "/activity/view/evaluation/work/my/editor/video/upload?workID=",
            autosavePath: "/activity/view/evaluation/work/my/editor/autosave",
        }
    },
    created() {
        this.activityID = this.activityId
        this.getMyWork()
    },
    computed: {
        ...mapGetters(["roles"]),
    },
    methods: {
        togglePreview() {
            this.preview = !this.preview
            this.previewButtonText = this.preview ? "编辑" : "预览"
        },
        toPreview() {
            this.preview = true
            this.previewButtonText = "编辑"
        },
        download(file) {
            download(file.response._id)
        },
        handleRemove(file, fileList) {
            this.work.files = fileList
        },
        handleSuccess(response, file, fileList) {
            this.work.files = fileList
        },
        handleSubmit() {
            let { work } = this
            work.workName = work.workName.trim()
            if (!work.workName) {
                this.$message.error("请输入作品名称")
                return
            }
            this.saving = true

            let { activityID, content, files, workName, sketch, _id: workID } = work
            files = files.map(e => {
                return e.response._id
            })
            submitWork({ activityID, work: { content, files, workName, sketch }, workID })
                .then(() => {
                    this.$message.success("提交成功")
                    this.getMyWork()
                    this.saving = false
                    this.toPreview()
                })
                .catch(err => {
                    console.log(err)
                    this.saving = false
                })
        },
        checkPermission,
        getMyWork() {
            this.loading = true
            let { activityID } = this
            getMyWork({ activityID })
                .then(res => {
                    this.loading = false
                    let { status } = res.data
                    if (status === "NoWork") {
                        this.status = "NoWork"
                    } else {
                        let { work } = res.data
                        this.work = work
                        if (this.work.isSubmit && !this.preview) {
                            this.togglePreview()
                        }
                        this.imageUploadPath += work._id
                        this.videoUploadPath += work._id
                        this.status = "Normal"
                    }
                })
                .catch(err => {
                    this.status = "Error"
                    this.errSubtitle = "Error: " + err.message
                    this.loading = false
                })
        },
        handleCreateWork() {
            this.creating = true
            let { activityID } = this
            createWork({ activityID })
                .then(() => {
                    this.creating = false
                    this.getMyWork()
                })
                .catch(err => {
                    console.log(err)
                })
        },
    },
}
</script>

<style lang='scss' >
.el-upload {
    width: 100%;
    .el-upload-dragger {
        width: 100%;
    }
}
</style>
