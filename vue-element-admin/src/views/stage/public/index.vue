<template>
    <div>
        <el-row class="subtitle">
            <el-col :span="18" :offset="3">
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
                    </el-form>
                </el-col>
            </el-row>
            <el-row style="margin-top: 20px">
                <el-col :span="18" :offset="3">
                    <el-divider />

                    <!--TODO:老师能访问私有空间以及老师标签在私有空间的加持显示-->
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
                                    :position="{ stageID }"
                                    :entry="entry"
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
import { getPubicStage } from "@/api/timeline-project"
import { getComments } from "@/api/comments"
import EditorViewer from "@/components/EditorViewer"
import download from "@/utils/download"
import { fileType, fileIcon } from "@/utils/fileType"
import Comment from "@/components/Comment"
import ProfilePopover from "@/components/ProfilePopover/profile-popover.vue"

export default {
    name: "TimeLineStage",
    components: { EditorViewer, Comment, ProfilePopover },
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
            entry: [],
            commentsData: {},
            commentsLoading: true,
            avatarPath: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            showUpPopoverKey: "",
            imageUploadPath:
                process.env.VUE_APP_BASE_API +
                "/activity/view/timeline/stage/editor/image/upload?stageID=" +
                stageID,
            videoUploadPath:
                process.env.VUE_APP_BASE_API +
                "/activity/view/timeline/stage/editor/video/upload?stageID=" +
                stageID,
            autosavePath: "/activity/view/timeline/stage/editor/autosave",
        }
    },
    created() {
        this.getStage()
    },
    methods: {
        getStage() {
            let { stageID } = this
            this.loading = true
            getPubicStage({ stageID })
                .then(res => {
                    this.stage = res.data.stage
                    this.entry = res.data.entry
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
            let type = "public"
            getComments({ stageID, type })
                .then(res => {
                    this.commentsData = res.data
                    this.commentsLoading = false
                })
                .catch()
        },

        download(file) {
            download(file.response._id)
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

