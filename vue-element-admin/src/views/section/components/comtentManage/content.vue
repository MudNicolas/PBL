<template>
    <div class="container" v-loading="loading">
        <div class="tools-wrapper">
            <div>
                <el-button type="primary" @click="newLinkDialogVisible = true" icon="el-icon-link">
                    添加链接
                </el-button>
                <el-button type="primary" icon="el-icon-document">添加文件</el-button>
                <el-button type="primary" icon="el-icon-s-cooperation">添加活动</el-button>
            </div>
            <div class="right-wrapper">
                <el-switch v-model="editable" active-text="启用编辑"></el-switch>
            </div>
        </div>
        <section-content-list :table-data="tableData">
            <template v-slot:opeationButton="scope">
                <span v-if="scope.row.type === 'url'">
                    <el-button icon="el-icon-view" type="primary" @click="openLink(scope.row.url)">
                        查看
                    </el-button>
                    <el-button v-show="editable" icon="el-icon-edit">编辑</el-button>
                    <el-button v-show="editable" type="danger" icon="el-icon-delete">
                        删除
                    </el-button>
                </span>
                <span v-if="scope.row.type === 'file'">
                    <el-button
                        icon="el-icon-download"
                        type="primary"
                        @click="download(scope.row._id)"
                    >
                        下载
                    </el-button>
                    <el-button v-show="editable" icon="el-icon-edit">编辑</el-button>
                    <el-button v-show="editable" type="danger" icon="el-icon-delete">
                        删除
                    </el-button>
                </span>
                <span v-if="scope.row.type === 'assignment'">
                    <el-button icon="el-icon-top-right" type="primary">进入</el-button>
                </span>
            </template>
        </section-content-list>
        <el-dialog title="添加链接" :visible.sync="newLinkDialogVisible">
            <new-link :section-id="sectionID" @success="newLinkSubmitted" />
        </el-dialog>
    </div>
</template>

<script>
import newLink from "./components/newLink.vue"
import uploadFile from "./components/uploadFile.vue"
import SectionContentList from "../components/contentList.vue"
import { getFileAndUrl } from "@/api/section"

export default {
    name: "SectionContentManage",
    components: { newLink, uploadFile, SectionContentList },
    props: ["sectionId"],
    data() {
        return {
            editable: false,
            loading: true,
            sectionID: this.sectionId,
            tableData: [],
            newLinkDialogVisible: false,
        }
    },
    created() {
        this.getFileAndUrl()
    },
    methods: {
        getFileAndUrl() {
            this.loading = true
            getFileAndUrl({ sectionID: this.sectionID })
                .then(res => {
                    this.tableData = res.data
                    this.loading = false
                })
                .catch()
        },
        newLinkSubmitted() {
            this.newLinkDialogVisible = false
            this.getFileAndUrl()
        },
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
    min-height: 200px;
    padding: 30px;
    color: #606266;

    .tools-wrapper {
        display: flex;
        align-items: center;
        margin-bottom: 24px;
        flex-direction: row;
        justify-content: flex-start;

        .right-wrapper {
            margin-left: auto;
        }
    }
}
</style>
