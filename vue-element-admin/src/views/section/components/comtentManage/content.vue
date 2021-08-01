<template>
    <div class="container" v-loading="loading">
        <div class="tools-wrapper">
            <div>
                <el-button type="primary" @click="newLinkDialogVisible = true" icon="el-icon-link">
                    添加链接
                </el-button>
                <el-button
                    type="primary"
                    icon="el-icon-document"
                    @click="newFileDialogVisible = true"
                >
                    添加文件
                </el-button>
                <router-link
                    :to="'/course/section/activity/create/' + sectionId"
                    style="margin-left: 10px"
                >
                    <el-button type="primary" icon="el-icon-s-cooperation">添加活动</el-button>
                </router-link>
            </div>
            <div class="right-wrapper">
                <el-switch v-model="editable" active-text="启用编辑"></el-switch>
            </div>
        </div>
        <section-content-list :table-data="tableData">
            <template v-slot:urlOperation="scope">
                <span style="margin-left: 10px">
                    <el-button
                        v-show="editable"
                        icon="el-icon-edit"
                        @click="editUrl(scope.row._id)"
                    >
                        编辑
                    </el-button>
                    <el-button
                        v-show="editable"
                        type="danger"
                        icon="el-icon-delete"
                        @click="deleteUrl(scope.row._id)"
                    >
                        删除
                    </el-button>
                </span>
            </template>
            <template v-slot:fileOperation="scope">
                <span style="margin-left: 10px">
                    <el-button
                        v-show="editable"
                        type="danger"
                        icon="el-icon-delete"
                        @click="deleteFile(scope.row._id)"
                    >
                        删除
                    </el-button>
                </span>
            </template>
        </section-content-list>
        <el-dialog title="添加链接" :visible.sync="newLinkDialogVisible">
            <new-link :section-id="sectionID" @success="newLinkSubmitted" />
        </el-dialog>
        <el-dialog title="添加文件" :visible.sync="newFileDialogVisible">
            <upload-file :section-id="sectionID" @success="newFileSubmitted" />
        </el-dialog>

        <el-dialog title="编辑链接" :visible.sync="editDialogVisible" :close-on-click-modal="false">
            <el-form label-position="right" label-width="80px" :model="editUrlData" ref="editUrl">
                <el-form-item label="名称">
                    <el-input v-model="editUrlData.name" placeholder="名称"></el-input>
                </el-form-item>
                <el-form-item
                    label="链接"
                    prop="url"
                    :rules="{
                        required: true,
                        message: '链接不能为空',
                        trigger: 'blur',
                    }"
                >
                    <el-input v-model="editUrlData.url" placeholder="链接">
                        <template slot="prepend">Http://</template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button @click="editDialogVisible = false">取消</el-button>
                    <el-button @click="submitEditUrl" type="primary" :loading="editUrlSubmitting">
                        确认
                    </el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import NewActivity from "./components/newActivity.vue"
import newLink from "./components/newLink.vue"
import uploadFile from "./components/uploadFile.vue"
import SectionContentList from "../components/contentList.vue"
import { getFileAndUrl, submitEditUrl, deleteUrl, deleteFile } from "@/api/section"

export default {
    name: "SectionContentManage",
    components: { newLink, uploadFile, SectionContentList, NewActivity },
    props: ["sectionId"],
    data() {
        return {
            editable: false,
            loading: true,
            sectionID: this.sectionId,
            tableData: {
                urls: [],
                files: [],
                activities: [],
            },
            newLinkDialogVisible: false,
            editUrlData: {
                _id: "",
                name: "",
                url: "",
            },
            editDialogVisible: false,
            editUrlSubmitting: false,
            newFileDialogVisible: false,
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
                    this.tableData = res.data.content
                    this.loading = false
                })
                .catch()
        },
        newLinkSubmitted() {
            this.newLinkDialogVisible = false
            this.getFileAndUrl()
        },
        newFileSubmitted() {
            this.newFileDialogVisible = false
            this.getFileAndUrl()
        },

        editUrl(_id) {
            this.editDialogVisible = true
            let e = this.tableData.url.find(e => e._id === _id)
            if (e) {
                this.editUrlData = {
                    _id: _id,
                    name: e.name,
                    url: e.url,
                }
            }
        },
        submitEditUrl() {
            this.editUrlData.url = this.editUrlData.url.trim()

            this.$refs.editUrl.validate(valid => {
                if (!valid) {
                    this.$message.warning("链接不能为空")
                    return
                }

                this.editUrlData.name = this.editUrlData.name.trim()
                if (!this.editUrlData.name) {
                    this.editUrlData.name = this.editUrlData.url
                }
                this.editUrlSubmitting = true
                submitEditUrl({ sectionID: this.sectionID, urlData: this.editUrlData })
                    .then(() => {
                        this.$message.success("链接编辑成功")
                        this.editUrlSubmitting = false
                        this.editDialogVisible = false
                        this.editUrlData = {
                            name: "",
                            url: "",
                        }
                        this.getFileAndUrl()
                    })
                    .catch(() => {
                        this.editUrlSubmitting = false
                    })
            })
        },
        deleteUrl(_id) {
            this.$confirm("确认删除此url？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                beforeClose: (action, instance, done) => {
                    if (action === "confirm") {
                        instance.confirmButtonLoading = true
                        deleteUrl({
                            sectionID: this.sectionID,
                            _id: _id,
                        })
                            .then(() => {
                                instance.confirmButtonLoading = false
                                this.$message({
                                    type: "success",
                                    message: "删除成功!",
                                })
                                this.getFileAndUrl()
                                done()
                            })
                            .catch(() => {
                                instance.confirmButtonLoading = false
                                done()
                            })
                    } else {
                        done()
                    }
                },
            }).catch(() => {})
        },
        deleteFile(_id) {
            this.$confirm("确认删除此文件？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                beforeClose: (action, instance, done) => {
                    if (action === "confirm") {
                        instance.confirmButtonLoading = true
                        deleteFile({
                            sectionID: this.sectionID,
                            _id: _id,
                        })
                            .then(() => {
                                instance.confirmButtonLoading = false
                                this.$message({
                                    type: "success",
                                    message: "删除成功!",
                                })
                                this.getFileAndUrl()
                                done()
                            })
                            .catch(() => {
                                instance.confirmButtonLoading = false
                                done()
                            })
                    } else {
                        done()
                    }
                },
            }).catch(() => {})
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
