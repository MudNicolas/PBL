<template>
    <div v-if="tableData">
        <el-table
            v-if="tableData.urls.length > 0"
            :data="tableData.urls"
            border
            style="width: 100%; margin-bottom: 30px"
        >
            <el-table-column label="链接">
                <el-table-column prop="name" label="名称">
                    <template slot-scope="scope">
                        <div class="content">
                            <el-link
                                @click="openLink(scope.row.url)"
                                target="_blank"
                                :underline="false"
                            >
                                <i class="el-icon-link" />
                                {{ scope.row.name }}
                            </el-link>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="url" label="链接">
                    <template slot-scope="scope">
                        <div class="content">
                            <el-link
                                @click="openLink(scope.row.url)"
                                target="_blank"
                                :underline="false"
                            >
                                {{ scope.row.url }}
                            </el-link>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="type" label="类型">
                    <template slot-scope="scope">
                        <el-tag type="info">链接</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="operation" label="操作" width="330px">
                    <template slot-scope="scope">
                        <el-button
                            icon="el-icon-view"
                            type="primary"
                            @click="openLink(scope.row.url)"
                        >
                            查看
                        </el-button>

                        <slot name="urlOperation" :row="scope.row"></slot>
                    </template>
                </el-table-column>
            </el-table-column>
        </el-table>
        <el-table
            v-if="tableData.files.length > 0"
            :data="tableData.files"
            border
            style="width: 100%; margin-bottom: 30px"
        >
            <el-table-column label="文件">
                <el-table-column prop="name" label="内容">
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

                <el-table-column prop="type" label="类型">
                    <template slot-scope="scope">
                        <el-tag>文件</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="operation" label="操作" width="330px">
                    <template slot-scope="scope">
                        <el-button
                            type="primary"
                            icon="el-icon-download"
                            @click="download(scope.row._id)"
                        >
                            下载
                        </el-button>

                        <slot name="fileOperation" :row="scope.row"></slot>
                    </template>
                </el-table-column>
            </el-table-column>
        </el-table>
        <el-table
            v-if="tableData.activities.length > 0"
            :data="tableData.activities"
            border
            style="width: 100%"
        >
            <el-table-column prop="name" label="活动">
                <el-table-column prop="name" label="名称">
                    <template slot-scope="scope">
                        <div class="content">
                            <router-link :to="'/course/section/activity/view/' + scope.row._id">
                                <i class="el-icon-s-cooperation" />
                                {{ scope.row.name }}
                            </router-link>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="类别">
                    <template slot-scope="scope">
                        <div class="content">{{ scope.row.type | activityType }}</div>
                    </template>
                </el-table-column>

                <el-table-column prop="type" label="类型">
                    <template slot-scope="scope">
                        <el-tag type="success">活动</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="operation" label="操作" width="330px">
                    <template slot-scope="scope">
                        <router-link :to="'/course/section/activity/view/' + scope.row._id">
                            <el-button type="primary" icon="el-icon-top-right">进入</el-button>
                        </router-link>
                        <slot name="activityOperation" :row="scope.row"></slot>
                    </template>
                </el-table-column>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import { fileType, fileIcon } from "@/utils/fileType"
import download from "@/utils/download"
import newLink from "../comtentManage/components/newLink.vue"

export default {
    components: { newLink },
    name: "SectionContentList",
    props: {
        tableData: {
            type: Object,
            default: {
                urls: [],
                files: [],
                activities: [],
            },
        },
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
        activityType: function (val) {
            let map = {
                TimeLineProject: "形成性项目",
            }
            return map[val]
        },
    },

    methods: {
        openLink(url) {
            window.open(`http://${url}`)
        },
        download(_id) {
            download(_id)
        },
    },
}
</script>

<style lang='scss' scoped>
.container {
    padding: 30px;
    color: #606266;
}

.content {
    span {
        cursor: pointer;
    }
}

.text {
    font-size: 14px;
}

.item {
    margin-bottom: 18px;
}

.box-card {
    margin-bottom: 10px;
}
</style>
