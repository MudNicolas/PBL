<template>
    <div>
        <div id="container">
            <affix :offset="120" boundary="container" style="position: absolute; right: 40px">
                <el-tooltip
                    effect="light"
                    content="重新加载评论"
                    placement="left"
                    :open-delay="200"
                >
                    <el-button
                        icon="el-icon-refresh"
                        circle
                        @click="reloadComments()"
                        style="transition: all 0.5s"
                        ref="refreshButton"
                    ></el-button>
                </el-tooltip>
            </affix>

            <div class="nav">共{{ comments.length }}条发言评论</div>

            <div v-for="comment of comments" :key="comment._id">
                <div class="header">
                    <el-popover
                        placement="left"
                        trigger="hover"
                        :open-delay="200"
                        width="360"
                        @show="showUpPopoverKey = comment.commentUser._id"
                    >
                        <div>
                            <profile-popover
                                :uid="comment.commentUser._id"
                                :show-up-popover-key="showUpPopoverKey"
                            />
                        </div>
                        <span slot="reference">
                            <el-avatar
                                :size="32"
                                :src="avatarPath + comment.commentUser.avatar"
                            ></el-avatar>
                        </span>
                    </el-popover>
                    <span class="text">
                        <span class="name">
                            {{ comment.commentUser.name }}
                        </span>
                        <span class="time">
                            {{ comment.time | timeFormat }}
                        </span>
                    </span>
                </div>
                <div class="comment">
                    <div class="main">
                        {{ comment.comment }}
                    </div>
                    <div class="tool">
                        <el-button
                            type="text"
                            icon="el-icon-s-comment"
                            @click="showReplayArea(comment._id)"
                        >
                            回复
                        </el-button>
                    </div>
                    <div class="reply-area" v-if="replyTo === comment._id">
                        <el-input
                            type="textarea"
                            :autosize="{ minRows: 2 }"
                            :placeholder="`回复@${comment.commentUser.name}:`"
                            v-model="myReply"
                        ></el-input>

                        <el-button type="primary" style="margin-top: 12px">回复</el-button>
                    </div>
                    <div class="replies">
                        <div v-for="reply of comment.reply" class="reply" :key="reply._id">
                            <div class="header">
                                <el-popover
                                    placement="left"
                                    trigger="hover"
                                    :open-delay="200"
                                    width="360"
                                    @show="showUpPopoverKey = comment.commentUser._id"
                                >
                                    <div>
                                        <profile-popover
                                            :uid="comment.commentUser._id"
                                            :show-up-popover-key="showUpPopoverKey"
                                        />
                                    </div>
                                    <span slot="reference">
                                        <el-avatar
                                            :size="32"
                                            :src="avatarPath + reply.from.avatar"
                                        ></el-avatar>
                                    </span>
                                </el-popover>
                                <span class="text">
                                    <span class="name">
                                        {{ reply.from.name }}
                                    </span>
                                    <span class="time">
                                        {{ reply.time | timeFormat }}
                                    </span>
                                </span>
                            </div>
                            <div class="comment">
                                {{ reply.content }}
                                <div class="tool">
                                    <el-button
                                        type="text"
                                        icon="el-icon-s-comment"
                                        @click="showReplayArea(reply._id)"
                                    >
                                        回复
                                    </el-button>
                                </div>
                                <div class="reply-area" v-if="replyTo === reply._id">
                                    <el-input
                                        type="textarea"
                                        :autosize="{ minRows: 2 }"
                                        :placeholder="`回复@${reply.from.name}:`"
                                        v-model="myReply"
                                    ></el-input>

                                    <el-button type="primary" style="margin-top: 12px">
                                        回复
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <el-form>
                <el-form-item>
                    <!--多条目的制作-->
                    <el-tabs type="border-card" v-if="entry.length > 0">
                        <el-tab-pane label="用户管理">用户管理</el-tab-pane>
                    </el-tabs>
                    <editor
                        v-else
                        ref="Editor"
                        :exist-content="myComment.comment[0].content"
                        :autosave-position="{
                            ...position,
                            commentID: myComment._id,
                            entry: 'default',
                        }"
                        :autosave-path="autosavePath"
                        :image-upload-path="imageUploadPath"
                        :video-upload-path="videoUploadPath"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSubmit">提交</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
import { formatTime } from "@/utils/index"
import ProfilePopover from "@/components/ProfilePopover/profile-popover.vue"
import Editor from "@/components/Editor"

import Affix from "@/components/Affix"

export default {
    name: "Comment",
    components: { ProfilePopover, Editor, Affix },
    props: {
        commentsData: {
            type: Object,
            default: {
                comments: [],
                tempComm: {
                    _id: "",
                    comment: [],
                },
            },
        },
        entry: {
            type: Array,
            default: () => [],
        },
        position: Object,
    },
    filters: {
        timeFormat: val => {
            return formatTime(new Date(val))
        },
    },
    data() {
        let stageID = this.$route.params.id
        return {
            stageID,

            avatarPath: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            autosavePath: "/activity/view/comments/editor/autosave",
            imageUploadPath: `${process.env.VUE_APP_BASE_API}/activity/view/comments/editor/image/upload?commentID=${this.commentsData.tempComm._id}&stageID=${stageID}`,
            videoUploadPath: `${process.env.VUE_APP_BASE_API}/activity/view/comments/editor/video/upload?commentID=${this.commentsData.tempComm._id}&stageID=${stageID}`,

            showUpPopoverKey: "",
            myReply: "",
            replyTo: "",
            deg: 0,
            myComment: this.commentsData.tempComm,
            comments: this.commentsData.comments,
        }
    },
    methods: {
        handleSubmit() {
            console.log(this.$refs.Editor.editor.html.get())
        },
        reloadComments() {
            this.$emit("reloadComments")
            this.deg -= 180
            this.$refs.refreshButton.$el.style.transform = `rotate(${this.deg}deg)`
        },
        showReplayArea(id) {
            if (this.replyTo === id) {
                this.replyTo = ""
            } else {
                this.replyTo = id
            }
        },
    },
}
</script>

<style lang='scss' scoped>
.nav {
    color: #909399;
    font-size: 13px;
    margin-bottom: 20px;
}

.header {
    display: flex;
    align-items: center;

    .text {
        line-height: 18px;
        margin-left: 10px;
        color: #606266;

        .time {
            margin-left: 10px;
            color: #bbb;
            font-size: 13px;
        }
    }
}

.tool {
    margin-top: 4px;
}

.comment {
    margin-left: 42px;
    color: #303133;
    margin-bottom: 22px;
    font-size: 14px;
    line-height: 1.5715;

    .main {
        border-left: 1px solid #cccccc;
        padding-left: 12px;
    }
}

.replies {
    margin-top: 20px;

    .reply:last-child {
        border-bottom: 1px solid #e6e6e6;
    }
}

.reply-area {
    margin-bottom: 30px;
}
</style>
