<template>
    <div style="padding-top: 15px">
        <div class="toolbar">
            <el-button
                type="primary"
                icon="el-icon-plus"
                @click="createTeamplateDialogVisible = !createTeamplateDialogVisible"
            >
                创建互评模板
            </el-button>
            <div class="right-panel">
                <el-switch v-model="editAndDeleteActive" active-text="启用编辑"></el-switch>
            </div>
        </div>
        <el-table
            :data="commentTemplate"
            :span-method="objectSpanMethod"
            border
            style="width: 100%; margin-top: 20px"
            v-loading="loading"
        >
            <el-table-column
                prop="name"
                label="模板名称"
                width="240"
                align="center"
            ></el-table-column>
            <el-table-column prop="title" label="模板条目"></el-table-column>
            <el-table-column label="操作" align="center" width="360">
                <template slot-scope="scope">
                    <el-button @click="preview(scope.row._id)">
                        <i class="el-icon-view" />
                        &nbsp;预览
                    </el-button>

                    <el-button
                        type="danger"
                        v-if="editAndDeleteActive"
                        :disabled="deleteSubmitting"
                        @click="deleteCommentTemplate(scope.row._id)"
                    >
                        <i class="el-icon-delete" />
                        &nbsp;删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog title="模板预览" :visible.sync="previewDialogVisible">
            <el-form>
                <el-form-item
                    v-for="entry of previewData"
                    :key="'perview' + entry._id + entry.title"
                >
                    <el-input placeholder="具体评论...">
                        <template slot="prepend">{{ entry.title }}</template>
                    </el-input>
                </el-form-item>
            </el-form>
        </el-dialog>

        <el-dialog title="创建互评模板" :visible.sync="createTeamplateDialogVisible">
            <el-form>
                <el-row>
                    <el-col>
                        <el-form-item style="margin-bottom: 0px">
                            <upload-excel-component
                                :on-success="handleLoadExcelSuccess"
                                :before-upload="beforeLoadExcel"
                                infoText="导入模板，将Excel文件拖到此处，或"
                                :tHeader="[
                                    '维度',
                                    '一星文本',
                                    '二星文本',
                                    '三星文本',
                                    '四星文本',
                                    '五星文本',
                                ]"
                                :filterVal="[
                                    'dimension',
                                    'star1',
                                    'star2',
                                    'star3',
                                    'star4',
                                    'star5',
                                ]"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col>
                        <el-form-item>
                            <el-table
                                :data="[]"
                                border
                                highlight-current-row
                                style="width: 100%; margin-top: 20px"
                            >
                                <el-table-column prop="学号" label="学号" sortable />
                                <el-table-column prop="姓名" label="姓名" />
                            </el-table>
                        </el-form-item>
                    </el-col>
                </el-row>
                <div style="display: flex">
                    <el-button style="margin-left: auto" @click="cancelLoadExcel">取消</el-button>
                    <el-button
                        type="primary"
                        :disabled="true"
                        @click="handleSubmit"
                        :loading="submitting"
                    >
                        导入
                    </el-button>
                </div>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import {
    getAllCommentTemplate,
    submitNewCommentTemplate,
    deleteCommentTemplate,
} from "@/api/course"
import UploadExcelComponent from "@/components/UploadExcel/index.vue"

export default {
    name: "CommentTemplate",
    props: ["courseId"],
    components: { UploadExcelComponent },
    created() {
        this.getAllCommentTemplate()
    },
    data() {
        return {
            commentTemplate: [],
            createTeamplateDialogVisible: false,
            previewDialogVisible: false,

            newCommentTemplate: {
                name: "",
                entry: [{ value: "" }],
            },
            newTemplateSubmitting: false,
            loading: true,
            previewData: [],
            submitting: false,
            deleteSubmitting: false,
            editAndDeleteActive: false,
        }
    },
    methods: {
        getAllCommentTemplate() {
            this.loading = true
            getAllCommentTemplate({ courseID: this.courseId }).then(res => {
                let rowTeamplate = res.data.commentTemplate
                this.transformTemplateData(rowTeamplate)
            })
        },
        transformTemplateData(data) {
            let tableData = []
            for (let template of data) {
                let entry = template.template
                let item = {}
                for (let i = 0; i < entry.length; i++) {
                    item = {
                        name: template.name,
                        title: entry[i],
                    }
                    if (i === 0) {
                        item.length = entry.length
                        item._id = template._id
                    }
                    tableData.push(item)
                }
            }
            //console.log(tableData)
            this.commentTemplate = []
            this.loading = false
        },
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 0 || columnIndex === 2) {
                if (row.length) {
                    return {
                        rowspan: row.length,
                        colspan: 1,
                    }
                } else {
                    return [0, 0]
                }
            }
        },
        formValidate(formName) {
            return new Promise((resolve, reject) => {
                this[formName].name = this[formName].name.trim()
                this[formName].entry.forEach(e => {
                    e.value = e.value.trim()
                })
                this.$refs[formName].validate(valid => {
                    if (valid) {
                        let temp = Object.assign({}, this[formName])
                        let entry = temp.entry.map(e => {
                            return e.value
                        })
                        temp.entry = entry
                        //console.log(temp)
                        resolve(temp)
                        return
                    } else {
                        this.$message({
                            message: "请将信息填写完整",
                            type: "warning",
                        })
                        reject()
                        return
                    }
                })
            })
        },
        submitTemplate(formName) {
            this.formValidate(formName).then(temp => {
                this.newTemplateSubmitting = true
                submitNewCommentTemplate({
                    courseID: this.courseId,
                    template: temp,
                })
                    .then(() => {
                        this.$message({
                            type: "success",
                            message: "添加模板成功",
                        })
                        this.newTemplateSubmitting = false
                        this.getAllCommentTemplate()
                        this.resetTemplate("newCommentTemplate")
                        this.createTeamplateDialogVisible = false
                    })
                    .catch(() => {
                        this.newTemplateSubmitting = false
                    })
            })
        },

        resetTemplate(formName) {
            this.$refs[formName].resetFields()
            this.newCommentTemplate = {
                name: "",
                entry: [{ value: "" }],
            }
        },
        removeEntry(item) {
            let index = this.newCommentTemplate.entry.indexOf(item)
            if (index !== -1) {
                this.newCommentTemplate.entry.splice(index, 1)
            }
        },

        addEntry() {
            this.newCommentTemplate.entry.push({
                value: "",
                key: Date.now(),
            })
        },

        preview(_id) {
            let tData = this.commentTemplate
            for (let i = 0; i < tData.length; i++) {
                if (tData[i]._id === _id) {
                    this.previewData = tData.slice(i, i + tData[i].length)
                    break
                }
            }
            this.previewDialogVisible = !this.previewDialogVisible
        },

        deleteCommentTemplate(_id) {
            this.$confirm(
                "确认删除此互评模板？删除后将无法再使用此模板，但已有的使用此模板的互评将继续显示",
                "提示",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                    beforeClose: (action, instance, done) => {
                        if (action === "confirm") {
                            instance.confirmButtonLoading = true
                            this.deleteSubmitting = true
                            deleteCommentTemplate({
                                courseID: this.courseId,
                                templateID: _id,
                            })
                                .then(() => {
                                    this.deleteSubmitting = false
                                    instance.confirmButtonLoading = false
                                    this.$message({
                                        type: "success",
                                        message: "删除成功!",
                                    })
                                    this.getAllCommentTemplate()
                                    done()
                                })
                                .catch(() => {
                                    this.deleteSubmitting = false
                                    instance.confirmButtonLoading = false
                                    done()
                                })
                        } else {
                            done()
                        }
                    },
                }
            ).catch(() => {})
        },
        handleLoadExcelSuccess() {},
        beforeLoadExcel() {},
        cancelLoadExcel() {},
        handleSubmit() {},
    },
}
</script>

<style lang="scss" scoped>
.new-template-footbar {
    display: flex;
}

.toolbar {
    display: flex;
    align-items: center;
    .right-panel {
        margin-left: auto;
    }
}
</style>
