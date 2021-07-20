<template>
    <div class="container">
        <div class="tools-wrapper">
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
                    <el-button v-show="editable" icon="el-icon-edit">编辑</el-button>
                    <el-button v-show="editable" type="danger" icon="el-icon-delete">
                        删除
                    </el-button>
                </span>
            </template>
        </section-content-list>
    </div>
</template>

<script>
import newLink from "./components/newLink.vue"
import uploadFile from "./components/uploadFile.vue"
import SectionContentList from "../components/contentList.vue"

export default {
    name: "SectionContentManage",
    components: { newLink, uploadFile, SectionContentList },
    props: ["tableData"],
    data() {
        return {
            editable: false,
        }
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
        margin-bottom: 18px;
        flex-direction: row;
        justify-content: flex-start;

        .right-wrapper {
            margin-left: auto;
        }
    }
}
</style>
