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
            :data="interEvaluationTemplate"
            :span-method="objectSpanMethod"
            border
            style="width: 100%; margin-top: 20px"
            v-loading="loading"
        >
            <el-table-column prop="name" label="模板名称" align="center"></el-table-column>
            <el-table-column prop="dimensionName" align="center" label="维度"></el-table-column>
            <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                    <el-button @click="preview(scope.row._id)">
                        <i class="el-icon-view" />
                        &nbsp;预览
                    </el-button>

                    <el-button
                        type="danger"
                        v-if="editAndDeleteActive"
                        :disabled="deleteSubmitting"
                        @click="deleteInterEvaluationTemplate(scope.row._id)"
                    >
                        <i class="el-icon-delete" />
                        &nbsp;删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog :title="previewData.name" :visible.sync="previewDialogVisible">
            <el-form>
                <el-form-item>
                    <el-table
                        :data="previewData.tableData"
                        border
                        highlight-current-row
                        style="width: 100%; margin-top: 20px"
                    >
                        <el-table-column prop="0" label="维度" />
                        <el-table-column prop="1" label="1星文本" />
                        <el-table-column prop="2" label="2星文本" />
                        <el-table-column prop="3" label="3星文本" />
                        <el-table-column prop="4" label="4星文本" />
                        <el-table-column prop="5" label="5星文本" />
                    </el-table>
                </el-form-item>
            </el-form>
        </el-dialog>

        <el-dialog title="创建互评模板" :visible.sync="createTeamplateDialogVisible" width="80%">
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
                                    '1星文本',
                                    '2星文本',
                                    '3星文本',
                                    '4星文本',
                                    '5星文本',
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
                                :data="newDimensionList"
                                border
                                highlight-current-row
                                style="width: 100%; margin-top: 20px"
                            >
                                <el-table-column prop="维度" label="维度" />
                                <el-table-column prop="1星文本" label="1星文本" />
                                <el-table-column prop="2星文本" label="2星文本" />
                                <el-table-column prop="3星文本" label="3星文本" />
                                <el-table-column prop="4星文本" label="4星文本" />
                                <el-table-column prop="5星文本" label="5星文本" />
                            </el-table>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item>
                            <el-input v-model="newTemplateName" placeholder="模板名称*"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <div style="display: flex">
                    <el-button style="margin-left: auto" @click="resetLoadExcel">取消</el-button>
                    <el-button
                        type="primary"
                        :disabled="newDimensionList.length === 0 || !newTemplateName.trim()"
                        @click="handleSubmit"
                        :loading="newDimensionSubmitting"
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
    submitNewInterEvaluationTemplate,
    getAllInterEvaluationTemplate,
    deleteInterEvaluationTemplate,
} from "@/api/course"
import UploadExcelComponent from "@/components/UploadExcel/index.vue"

export default {
    name: "InterEvaluationTemplate",
    props: ["courseId"],
    components: { UploadExcelComponent },
    created() {
        this.getAllInterEvaluationTemplate()
    },
    data() {
        return {
            interEvaluationTemplate: [],
            rawInterEvaluationTemplate: [],
            createTeamplateDialogVisible: false,
            previewDialogVisible: false,
            newDimensionList: [],
            newTemplateName: "",
            newTemplateSubmitting: false,
            loading: true,
            previewData: [],
            newDimensionSubmitting: false,
            deleteSubmitting: false,
            editAndDeleteActive: false,
        }
    },
    methods: {
        getAllInterEvaluationTemplate() {
            this.loading = true
            getAllInterEvaluationTemplate({ courseID: this.courseId }).then(res => {
                let rowTeamplate = res.data.interEvaluationTemplate
                this.rawInterEvaluationTemplate = rowTeamplate
                console.log(rowTeamplate)
                this.transformTemplateData(rowTeamplate)
            })
        },
        transformTemplateData(data) {
            let tableData = []
            for (let template of data) {
                let { dimensions } = template
                let item = {}
                for (let i = 0; i < dimensions.length; i++) {
                    item = {
                        name: template.name,
                        dimensionName: dimensions[i].dimensionName,
                    }
                    if (i === 0) {
                        item.length = dimensions.length
                        item._id = template._id
                    }
                    tableData.push(item)
                }
            }
            //console.log(tableData)
            this.interEvaluationTemplate = tableData
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

        preview(_id) {
            let rawData = this.rawInterEvaluationTemplate
            let previewData = {
                name: "",
                tableData: [],
            }
            for (let i = 0; i < rawData.length; i++) {
                if (rawData[i]._id.toString() === _id) {
                    console.log(rawData[i].dimensions)
                    previewData.name = rawData[i].name
                    previewData.tableData = rawData[i].dimensions.map(e => [
                        e.dimensionName,
                        ...e.starText,
                    ])
                    break
                }
            }
            console.log(previewData)
            this.previewData = previewData
            this.previewDialogVisible = !this.previewDialogVisible
        },

        deleteInterEvaluationTemplate(_id) {
            this.$confirm(
                "确认删除此互评模板？删除后将无法再使用此模板，但不影响已使用本模板的活动",
                "提示",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                    beforeClose: (action, instance, done) => {
                        if (action === "confirm") {
                            instance.confirmButtonLoading = true
                            this.deleteSubmitting = true
                            deleteInterEvaluationTemplate({
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
                                    this.getAllInterEvaluationTemplate()
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
        handleLoadExcelSuccess({ results }) {
            let newDimensionList = []
            console.log(results)
            for (let dimension of results) {
                if (!this.checkDimension(dimension)) {
                    this.$message({
                        type: "warning",
                        message: "文件错误，请遵循模板格式填入信息！",
                    })

                    return false
                } else {
                    dimension["维度"] = (dimension["维度"] || "").toString().trim()
                    for (let i = 1; i <= 5; i++) {
                        dimension[`${i}星文本`] = (dimension[`${i}星文本`] || "").toString().trim()
                    }
                    newDimensionList.push(dimension)
                }
            }
            this.newDimensionList = newDimensionList
        },
        checkDimension(d) {
            d["维度"] = (d["维度"] || "").toString().trim()
            if (!d["维度"]) return false

            for (let i = 1; i <= 5; i++) {
                d[`${i}星文本`] = (d[`${i}星文本`] || "").toString().trim()
                if (!d[`${i}星文本`]) return false
            }
            return true
        },
        beforeLoadExcel(file) {
            const isLt1M = file.size / 1024 / 1024 < 1

            if (isLt1M) {
                return true
            }

            this.$message({
                message: "文件大小限制1MB",
                type: "warning",
            })
            return false
        },
        resetLoadExcel() {
            this.createTeamplateDialogVisible = false
            this.newDimensionSubmitting = false
            this.newDimensionList = []
            this.newTemplateName = ""
        },
        handleSubmit() {
            this.newDimensionSubmitting = true
            let list = this.newDimensionList
            let newTemplateName = this.newTemplateName
            console.log(newTemplateName, list)
            for (let dimension of list) {
                if (!this.checkDimension(dimension)) {
                    this.$message({
                        type: "warning",
                        message: "文件错误，请遵循模板格式填入信息！",
                    })
                    return false
                }
            }
            if (!newTemplateName.trim()) {
                this.$message({
                    type: "warning",
                    message: "请输入模板名称",
                })
                return false
            }
            let data = {
                newTemplateName,
                dimensionList: list,
            }
            submitNewInterEvaluationTemplate({
                courseID: this.courseId,
                template: data,
            })
                .then(() => {
                    this.$message({
                        type: "success",
                        message: "添加模板成功",
                    })

                    this.getAllInterEvaluationTemplate()
                    this.resetLoadExcel()
                })
                .catch(err => {
                    this.$message.error(err)
                })
        },
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
