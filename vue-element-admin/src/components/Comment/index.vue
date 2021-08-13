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
                    <el-button icon="el-icon-refresh" circle @click="reloadComments"></el-button>
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
                    <!--TODO: 评论图片视频的上传路径-->
                    <editor ref="Editor" />
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
        comments: {
            type: Array,
            default: [],
        },
        position: {
            type: Object,
        },
    },
    filters: {
        timeFormat: val => {
            return formatTime(new Date(val))
        },
    },
    data() {
        return {
            avatarPath: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            showUpPopoverKey: "",
            myReply: "",
            replyTo: "",
        }
    },
    methods: {
        handleSubmit() {
            console.log(this.$refs.Editor.editor.html.get())
        },
        reloadComments() {
            this.$emit("reloadComments")
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
