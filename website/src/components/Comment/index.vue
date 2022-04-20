<template>
  <div>
    <div id="container">
      <sticky :sticky-top="120" style="position: absolute; right: 40px">
        <el-tooltip
          effect="light"
          content="重新加载评论"
          placement="left"
          :open-delay="200"
        >
          <el-button
            ref="refreshButton"
            icon="el-icon-refresh"
            circle
            style="transition: all 0.5s"
            @click="reloadComments()"
          />
        </el-tooltip>
      </sticky>

      <div class="nav">共{{ commentsData.comments.length }}条发言评论</div>

      <div v-for="comment of commentsData.comments" :key="comment._id" class="single-comment">
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
              <el-avatar :size="32" :src="avatarPath + comment.commentUser.avatar" />
            </span>
          </el-popover>
          <span class="text">
            <span class="name">
              {{ comment.commentUser.name }}
            </span>
            <el-tag
              v-if="comment.commentUserRole && comment.commentUserRole !== 'student'"
              size="mini"
            >
              {{ comment.commentUserRole | roleFilter }}
            </el-tag>
            <span class="time">
              {{ comment.time | timeFormat }}
            </span>
            <span class="viewable">
              <el-button
                circle
                size="mini"
                @click="toggleCommentVisiable(comment._id)"
              >
                <i class="el-icon-view" />
              </el-button>
            </span>
          </span>
          <span v-if="commentable || !checkPermission(['student'])" class="right-panel">
            <span
              v-if="uid === comment.commentUser._id || !checkPermission(['student'])"
              class="remove-comment"
            >
              <el-dropdown
                trigger="click"
                placement="bottom"
                @command="handleRemoveComment"
              >
                <el-button type="text" icon="el-icon-more-outline" />
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item icon="el-icon-delete" :command="comment._id">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </span>
          </span>
        </div>

        <div v-show="showCommentsList.indexOf(comment._id) !== -1" class="comment">
          <div class="main">
            <span v-if="comment.rate && comment.rate.length > 0">
              <el-form>
                <el-form-item
                  v-for="(dimension, index) of entry"
                  :key="index"
                  :label="dimension"
                  class="rate"
                >
                  <el-rate
                    v-model="comment.rate[index]"
                    disabled
                    show-text
                    :texts="starText[index]"
                  />
                </el-form-item>
              </el-form>
            </span>
            <span v-if="comment.comment.length === 1">
              <editor-viewer :content="comment.comment[0].content" />
            </span>
            <span v-else>
              <el-tabs type="card">
                <el-tab-pane
                  v-for="c of comment.comment"
                  :key="c._id"
                  :label="c.entry"
                >
                  <editor-viewer :content="c.content" />
                </el-tab-pane>
              </el-tabs>
            </span>
          </div>
          <span v-if="commentable || !checkPermission(['student'])">
            <div class="tool">
              <el-button
                type="text"
                icon="el-icon-s-comment"
                @click="showReplayArea(comment._id)"
              >
                回复
              </el-button>
            </div>
            <div v-if="replyTo === comment._id" class="reply-area">
              <el-input
                v-model="myReply"
                type="textarea"
                :autosize="{ minRows: 2 }"
                :placeholder="`回复@${comment.commentUser.name}:`"
              />

              <el-button
                type="primary"
                style="margin-top: 12px"
                :loading="replying"
                @click="handleReply(comment._id)"
              >
                回复
              </el-button>
            </div>
          </span>
          <div class="replies">
            <div v-for="reply of comment.reply" :key="reply._id" class="reply">
              <div class="header">
                <el-popover
                  placement="left"
                  trigger="hover"
                  :open-delay="200"
                  width="360"
                  @show="showUpPopoverKey = reply.fromUser._id"
                >
                  <div>
                    <profile-popover
                      :uid="reply.fromUser._id"
                      :show-up-popover-key="showUpPopoverKey"
                    />
                  </div>
                  <span slot="reference">
                    <el-avatar
                      :size="32"
                      :src="avatarPath + reply.fromUser.avatar"
                    />
                  </span>
                </el-popover>
                <span class="text">
                  <span class="name">
                    {{ reply.fromUser.name }}
                  </span>
                  <el-tag
                    v-if="
                      reply.fromUserRole && reply.fromUserRole !== 'student'
                    "
                    size="mini"
                  >
                    {{ reply.fromUserRole | roleFilter }}
                  </el-tag>
                  <span class="time">
                    {{ reply.time | timeFormat }}
                  </span>
                </span>
                <span
                  v-if="commentable || !checkPermission(['student'])"
                  class="right-panel"
                >
                  <span
                    v-if="
                      uid === reply.fromUser._id ||
                        !checkPermission(['student'])
                    "
                    class="remove-comment"
                  >
                    <el-dropdown
                      trigger="click"
                      placement="bottom"
                      @command="handleRemoveReply"
                    >
                      <el-button type="text" icon="el-icon-more-outline" />
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item
                          icon="el-icon-delete"
                          :command="{
                            replyID: reply._id,
                            commentID: comment._id,
                          }"
                        >
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </span>
                </span>
              </div>
              <div class="comment">
                <span v-if="reply.toReply">回复 @{{ reply.toUser.name }}：</span>
                {{ reply.content }}
                <span v-if="commentable || !checkPermission(['student'])">
                  <div class="tool">
                    <el-button
                      type="text"
                      icon="el-icon-s-comment"
                      @click="showReplayArea(reply._id)"
                    >
                      回复
                    </el-button>
                  </div>
                  <div v-if="replyTo === reply._id" class="reply-area">
                    <el-input
                      v-model="myReply"
                      type="textarea"
                      :autosize="{ minRows: 2 }"
                      :placeholder="`回复@${reply.fromUser.name}:`"
                    />

                    <el-button
                      type="primary"
                      style="margin-top: 12px"
                      :loading="replying"
                      @click="handleReply(comment._id, reply._id)"
                    >
                      回复
                    </el-button>
                  </div>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-form v-if="commentable || !checkPermission(['student'])" style="margin-top: 60px">
        <el-form-item>
          <!--多条目的制作-->
          <el-tabs v-if="entry.length > 0" type="card">
            <el-tab-pane v-for="e of entry" :key="'comentry' + e" :label="e" lazy>
              <editor
                ref="Editors"
                :exist-content="
                  commentsData.tempComm.comment | commentContentFilter(e)
                "
                :autosave-position="{
                  ...position,
                  commentID: commentsData.tempComm._id,
                  entry: e,
                }"
                :autosave-path="autosavePath"
                :image-upload-path="imageUploadPath"
                :video-upload-path="videoUploadPath"
              />
            </el-tab-pane>
          </el-tabs>
          <editor
            v-else
            ref="Editor"
            :exist-content="
              commentsData.tempComm.comment[0]
                ? commentsData.tempComm.comment[0].content
                : ''
            "
            :autosave-position="{
              ...position,
              commentID: commentsData.tempComm._id,
              entry: 'default',
            }"
            :autosave-path="autosavePath"
            :image-upload-path="imageUploadPath"
            :video-upload-path="videoUploadPath"
          />
        </el-form-item>
        <span v-if="starText.length > 0">
          <el-form-item
            v-for="(dimension, index) of entry"
            :key="index"
            :label="dimension"
            class="rate"
          >
            <el-rate v-model="rate[index]" show-text :texts="starText[index]" />
          </el-form-item>
        </span>
        <el-form-item>
          <el-button type="primary" :loading="commentSubmitting" @click="handleSubmit">
            提交
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { formatTime } from '@/utils/index'
import ProfilePopover from '@/components/ProfilePopover/profile-popover.vue'
import Editor from '@/components/Editor'
import EditorViewer from '@/components/EditorViewer'
import { submitComment, removeComment, submitReply, removeReply } from '@/api/comments'
import { mapGetters } from 'vuex'
import checkPermission from '@/utils/permission' // 权限判断函数
import Sticky from '@/components/Sticky'

export default {
    name: 'Comment',
    components: { ProfilePopover, Editor, EditorViewer, Sticky },
    filters: {
        timeFormat: val => {
            return formatTime(new Date(val))
        },
        commentContentFilter: (val, e) => {
            const i = val.find(c => c.entry === e)
            if (i) return i.content
            return ''
        },
        roleFilter: val => {
            const map = {
                teacher: '教师',
                admin: '管理员'
            }
            return map[val]
        }
    },
    props: {
        commentsData: {
            type: Object,
            default: () => {
                return {
                    comments: [],
                    tempComm: {
                        _id: '',
                        comment: []
                    }
                }
            }
        },
        entry: {
            type: Array,
            default: () => []
        },
        starText: {
            type: Array,
            default: () => []
        },
        position: Object,
        commentable: {
            type: Boolean,
            default: true
        }
    },

    data() {
        const contentName = this.position.name
        const contentID = this.position[contentName]
        return {
            [contentName]: contentID,
            commentSubmitting: false,
            avatarPath: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            autosavePath: '/activity/view/comments/editor/autosave',
            imageUploadPath: `${process.env.VUE_APP_BASE_API}/activity/view/comments/editor/image/upload?commentID=${this.commentsData.tempComm._id}&${contentName}=${contentID}`,
            videoUploadPath: `${process.env.VUE_APP_BASE_API}/activity/view/comments/editor/video/upload?commentID=${this.commentsData.tempComm._id}&${contentName}=${contentID}`,
            showCommentsList: [],
            showUpPopoverKey: '',
            myReply: '',
            replyTo: '',
            deg: 0,
            replying: false,
            rate: []
        }
    },
    computed: {
        ...mapGetters(['uid', 'roles'])
    },
    methods: {
        checkPermission,
        handleSubmit() {
            let comments = []
            if (this.entry.length === 0) {
                comments.push({
                    entry: 'default',
                    content: this.$refs.Editor.editor.html.get()
                })
            } else {
                const editors = this.$refs.Editors
                comments = this.entry.map(e => {
                    const theEditor = editors.find(editor => editor.autosavePosition.entry === e)
                    const content = this.handleEntryComments(theEditor, e)
                    return {
                        entry: e,
                        content
                    }
                })
            }
            const rate = this.rate
            if (this.starText.length > 0) {
                if (rate.includes(0)) {
                    this.$message.warning('请完整打分评价')
                    return
                }
            }
            this.commentSubmitting = true
            const commentID = this.commentsData.tempComm._id
            submitComment({ comments, ...this.position, commentID, rate })
                .then(() => {
                    this.$message.success('提交成功')
                    if (this.$refs.Editor) this.$refs.Editor.editor.html.set('')
                    if (this.$refs.Editors) {
                        this.$refs.Editors.forEach(e => {
                            e.editor.html.set('')
                        })
                    }
                    this.rate = []
                    this.commentSubmitting = false

                    this.reloadComments()
                })
                .catch(err => {
                    console.log(err)
                    this.commentSubmitting = false
                })
        },
        handleEntryComments(editor, entry) {
            if (editor) return editor.editor.html.get()
            const t = this.commentsData.tempComm.comment.find(c => c.entry === entry)
            if (t) return t.content
            return ''
        },
        reloadComments() {
            this.$emit('reloadComments')
            this.deg -= 180
            this.$refs.refreshButton.$el.style.transform = `rotate(${this.deg}deg)`
        },
        showReplayArea(id) {
            if (this.replyTo === id) {
                this.replyTo = ''
            } else {
                this.replyTo = id
            }
        },
        handleRemoveComment(_id) {
            this.$confirm('确定移除这条发言？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: (action, instance, done) => {
                    if (action === 'confirm') {
                        instance.confirmButtonLoading = true
                        const commentID = _id

                        removeComment({ commentID, ...this.position })
                            .then(() => {
                                this.$message.success('移除成功')
                                this.$emit('reloadComments')
                                instance.confirmButtonLoading = false
                                done()
                            })
                            .catch(() => {
                                instance.confirmButtonLoading = false
                                done()
                            })
                    } else {
                        done()
                    }
                }
            }).catch(err => {
                console.log(err)
            })
        },
        handleRemoveReply(e) {
            this.$confirm('确定移除这条回复？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: (action, instance, done) => {
                    if (action === 'confirm') {
                        instance.confirmButtonLoading = true
                        removeReply({ ...e, ...this.position })
                            .then(() => {
                                this.$message.success('移除成功')
                                this.$emit('reloadComments')
                                instance.confirmButtonLoading = false
                                done()
                            })
                            .catch(() => {
                                instance.confirmButtonLoading = false
                                done()
                            })
                    } else {
                        done()
                    }
                }
            }).catch(() => {})
        },
        handleReply(commentID, replyID) {
            this.replying = true
            const reply = this.myReply
            submitReply({ reply, commentID, replyID, ...this.position })
                .then(() => {
                    this.$message.success('发送成功')
                    this.replyTo = ''

                    this.myReply = ''
                    this.$emit('reloadComments')
                    this.replying = false
                })
                .catch(() => {
                    this.replying = false
                })
        },
        toggleCommentVisiable(commentID) {
            if (this.showCommentsList.indexOf(commentID) !== -1) {
                this.showCommentsList.splice(this.showCommentsList.indexOf(commentID), 1)
            } else {
                this.showCommentsList.push(commentID)
            }
        }
    }
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
    margin-bottom: 10px;

    .text {
        line-height: 18px;
        margin-left: 10px;
        color: #606266;

        .time {
            margin-left: 10px;
            color: #bbb;
            font-size: 13px;
        }

        .viewable {
            margin-left: 8px;
        }
    }

    .right-panel {
        margin-left: auto;
    }
}

.tool {
    margin-top: 4px;
}

.rate {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.single-comment {
    margin-bottom: 24px;
    > .comment {
        margin-left: 42px;
        color: #303133;
        font-size: 14px;
        line-height: 1.5715;
        //border-bottom: 1px solid #e6e6e6;
    }
}

.replies {
    margin-top: 20px;

    .reply {
        .comment {
            margin-left: 42px;
            color: #303133;
            margin-bottom: 22px;
            font-size: 14px;
            line-height: 1.5715;
            padding-bottom: 10px;
        }
    }
    .reply:not(:last-child) {
        .comment {
            margin-left: 42px;
            color: #303133;
            margin-bottom: 22px;
            font-size: 14px;
            line-height: 1.5715;
            border-bottom: 1px solid #e6e6e6;
        }
    }
}

.reply-area {
    margin-bottom: 30px;
}
</style>
<style lang='scss'>
.el-rate {
    display: flex;
    align-items: center;
}
.el-form-item__label {
    white-space: nowrap;
}
</style>
