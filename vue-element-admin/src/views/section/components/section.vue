<template>
    <div v-loading="loading" class="container">
        <div class="header">
            <div class="title">{{ section.name }}</div>
            <div class="info">{{ section.info | noInfo }}</div>
        </div>
        <div>
            <el-table :data="tableData" border style="width: 100%">
                <el-table-column prop="name" label="内容">
                    <template slot-scope="scope">
                        <svg-icon
                            v-if="scope.row.type === 'file'"
                            :icon-class="scope.row.name | fileType"
                        />

                        <i v-if="scope.row.type === 'url'" class="el-icon-link" />
                        <i v-if="scope.row.type === 'assignment'" class="el-icon-s-cooperation" />
                        {{ scope.row.name }}
                    </template>
                </el-table-column>
                <el-table-column prop="type" label="类型">
                    <template slot-scope="scope">
                        {{ scope.row.type | type }}
                    </template>
                </el-table-column>
                <el-table-column prop="operation" label="操作">
                    <template slot-scope="scope">
                        <el-button
                            v-if="scope.row.type === 'url'"
                            type="primary"
                            icon="el-icon-view"
                        >
                            查看
                        </el-button>
                        <el-button
                            v-if="scope.row.type === 'file'"
                            type="primary"
                            icon="el-icon-download"
                        >
                            下载
                        </el-button>
                        <el-button
                            v-if="scope.row.type === 'assignment'"
                            type="primary"
                            icon="el-icon-top-right"
                        >
                            进入
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
import { getSectionView } from "@/api/section"

export default {
    name: "SectionContent",
    props: ["sectionId"],
    filters: {
        noInfo: function (val) {
            if (!val) {
                return "暂无简介"
            }
            return val
        },
        type: function (val) {
            let map = {
                file: "文件",
                url: "链接",
                assignment: "活动",
            }
            return map[val]
        },
        fileType: function (val) {
            if (val.split(".").length === 1) {
                return "blank"
            }
            return val.split(".")[val.split(".").length - 1]
        },
    },
    data() {
        return {
            sectionID: this.sectionId,
            loading: true,
            section: {},
            tableData: [],
        }
    },
    created() {
        this.getSectionView()
    },
    methods: {
        getSectionView() {
            this.loading = true
            getSectionView({ sectionID: this.sectionID })
                .then(res => {
                    this.tableData = res.data.content
                    this.section.name = res.data.name
                    this.section.info = res.data.info

                    this.loading = false
                })
                .catch()
        },
    },
}
</script>

<style lang='scss' scoped>
.container {
    padding: 30px;
    color: #606266;

    .header {
        .title {
            font-size: 20px;
            margin-bottom: 10px;
            line-height: 1.7;
        }
        .info {
            font-size: 14px;
            margin-bottom: 30px;
        }
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
