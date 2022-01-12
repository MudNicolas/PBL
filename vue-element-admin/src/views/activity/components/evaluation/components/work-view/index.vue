<template>
    <div>
        <el-form-item>
            <div class="name">
                {{ work.workName }}
            </div>
        </el-form-item>
        <el-form-item>
            <div class="author-area">
                <div v-for="user of work.authors" :key="user._id">
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
                                <el-avatar :size="24" :src="avatarPath + user.avatar"></el-avatar>
                            </span>
                        </el-popover>
                    </div>
                </div>
            </div>
        </el-form-item>
        <el-form-item>
            <div class="sketch">
                {{ work.sketch }}
            </div>
        </el-form-item>
        <el-form-item v-if="work._id">
            <editor-viewer :content="work.content"></editor-viewer>
        </el-form-item>
        <el-form-item>
            <el-table v-if="work.files.length > 0" :data="work.files" border style="width: 100%">
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
                        <el-button type="text" icon="el-icon-download" @click="download(scope.row)">
                            下载
                        </el-button>

                        <slot name="fileOperation" :row="scope.row"></slot>
                    </template>
                </el-table-column>
            </el-table>
        </el-form-item>
    </div>
</template>

<script>
import EditorViewer from "@/components/EditorViewer"
import { fileType, fileIcon } from "@/utils/fileType"
import download from "@/utils/download"
import ProfilePopover from "@/components/ProfilePopover/profile-popover.vue"

export default {
    props: ["work"],
    components: { EditorViewer, ProfilePopover },
    data() {
        return {
            showUpPopoverKey: "",
            avatarPath: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
        }
    },
    filters: {
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
    methods: {
        download(file) {
            download(file.response._id)
        },
    },
}
</script>

<style lang="scss" scoped>
.name {
    align-items: center;
    display: flex;
    font-size: 22px;
    color: #303133;
}
.author-area {
    align-items: center;
    display: flex;
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

.author {
    margin-right: 6px;
}
</style>
