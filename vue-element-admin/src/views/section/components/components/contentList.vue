<template>
    <div v-if="tableData">
        <el-table :data="tableData" border style="width: 100%">
            <el-table-column prop="name" label="内容">
                <template slot-scope="scope">
                    <div class="content">
                        <a :href="scope.row.url" target="_blank" v-if="scope.row.type === 'url'">
                            <i class="el-icon-link" />
                            {{ scope.row.name }}
                        </a>
                        <span v-if="scope.row.type === 'file'" @click="download(scope.row._id)">
                            <svg-icon :icon-class="scope.row.name | fileType" />
                            {{ scope.row.name }}
                        </span>
                        <span v-if="scope.row.type === 'assignment'">
                            <i class="el-icon-s-cooperation" />
                            {{ scope.row.name }}
                        </span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="type" label="类型">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.type | tagType">
                        {{ scope.row.type | type }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="operation" label="操作">
                <template slot-scope="scope">
                    <slot name="opeationButton" :row="scope.row"></slot>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import includeFileType from "@/utils/fileType"
import download from "@/utils/download"

export default {
    name: "SectionContentList",
    props: ["tableData"],
    filters: {
        type: function (val) {
            let map = {
                file: "文件",
                url: "链接",
                assignment: "活动",
            }
            return map[val]
        },
        fileType: function (val) {
            let type = includeFileType(val)
            if (type) {
                return type
            }
            return "blank"
        },
        tagType: function (val) {
            let map = {
                file: "",
                url: "info",
                assignment: "success",
            }
            return map[val]
        },
    },
    data() {
        return {
            loading: true,
            section: {},
        }
    },

    methods: {
        openLink(url) {
            console.log(url)
            window.open(url)
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
