<template>
    <div style="padding-top: 15px">
        <div>
            <el-button
                type="primary"
                icon="el-icon-plus"
                @click="
                    createTeamplateDialogVisible = !createTeamplateDialogVisible
                "
                >创建评论模板</el-button
            >
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
            >
            </el-table-column>
            <el-table-column prop="title" label="模板条目"> </el-table-column>
            <el-table-column label="操作" align="center" width="360">
                <template slot-scope="scope">
                    <el-button @click="preview(scope.row._id)"
                        ><i class="el-icon-view" />&nbsp;预览</el-button
                    >
                    <el-button type="primary" @click="edit(scope.row._id)"
                        ><i class="el-icon-edit" />&nbsp;编辑</el-button
                    >
                    <el-button type="danger"
                        ><i class="el-icon-delete" />&nbsp;删除</el-button
                    >
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
        <el-dialog title="编辑模板" :visible.sync="editDialogVisible">
            <el-form
                :model="editData"
                ref="editData"
                label-position="right"
                label-width="80px"
            >
                <el-form-item
                    label="模板名"
                    prop="name"
                    :rules="{
                        required: true,
                        message: '模板名不能为空',
                        trigger: 'blur',
                    }"
                >
                    <el-row>
                        <el-col :span="16">
                            <el-input v-model="editData.name" />
                        </el-col>
                    </el-row>
                </el-form-item>

                <el-form-item
                    v-for="(entry, index) of editData.entry"
                    :key="'perview' + entry.key"
                    :label="'条目' + index"
                    :prop="'entry.' + index + '.value'"
                    :rules="{
                        required: true,
                        message: '条目不能为空',
                        trigger: 'blur',
                    }"
                >
                    <el-row>
                        <el-col :span="16">
                            <el-input v-model="entry.value" />
                        </el-col>
                        <el-button
                            v-if="editData.entry.length > 1"
                            @click.prevent="inEditRemoveEntry(entry)"
                            style="margin-left: 12px"
                            type="danger"
                            >删除</el-button
                        >
                    </el-row>
                </el-form-item>
                <el-form-item>
                    <el-row>
                        <el-col :span="16">
                            <div class="new-template-footbar">
                                <el-button @click="inEditAddEntry"
                                    >新增条目</el-button
                                >
                                <el-button
                                    type="primary"
                                    :loading="editSubmitting"
                                    @click="inEditSubmitTemplate('editData')"
                                    >提交</el-button
                                >
                            </div>
                        </el-col>
                    </el-row>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog
            title="创建评论模板"
            :visible.sync="createTeamplateDialogVisible"
        >
            <el-form
                :model="newCommentTemplate"
                ref="newCommentTemplate"
                label-position="right"
                label-width="80px"
            >
                <el-form-item
                    prop="name"
                    label="模板名"
                    :rules="{
                        required: true,
                        message: '模板名不能为空',
                        trigger: 'blur',
                    }"
                >
                    <el-row>
                        <el-col :span="16">
                            <el-input
                                v-model="newCommentTemplate.name"
                            ></el-input>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item
                    v-for="(entry, index) of newCommentTemplate.entry"
                    :label="'条目' + index"
                    :key="entry.key"
                    :prop="'entry.' + index + '.value'"
                    :rules="{
                        required: true,
                        message: '条目不能为空',
                        trigger: 'blur',
                    }"
                >
                    <el-row>
                        <el-col :span="16">
                            <el-input
                                v-model="entry.value"
                                style="margin-right: 10px"
                            ></el-input>
                        </el-col>

                        <el-button
                            v-if="newCommentTemplate.entry.length > 1"
                            @click.prevent="removeEntry(entry)"
                            style="margin-left: 12px"
                            type="danger"
                            >删除</el-button
                        >
                    </el-row>
                </el-form-item>
                <el-form-item>
                    <el-row>
                        <el-col :span="16">
                            <div class="new-template-footbar">
                                <el-button @click="addEntry"
                                    >新增条目</el-button
                                >
                                <el-button
                                    type="primary"
                                    :loading="newTemplateSubmitting"
                                    @click="
                                        submitTemplate('newCommentTemplate')
                                    "
                                    >提交</el-button
                                >
                                <el-popconfirm
                                    title="确定将输入的信息重置吗？"
                                    style="margin-left: auto"
                                    @confirm="
                                        resetTemplate('newCommentTemplate')
                                    "
                                >
                                    <el-button slot="reference" type="danger"
                                        >重置</el-button
                                    >
                                </el-popconfirm>
                            </div>
                        </el-col>
                    </el-row>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import {
    getAllCommentTemplate,
    submitNewCommentTemplate,
    editCommentTemplate,
} from "@/api/course";
export default {
    name: "CommentTemplate",
    props: ["courseId"],
    created() {
        this.getAllCommentTemplate();
    },
    data() {
        return {
            commentTemplate: [],
            createTeamplateDialogVisible: false,
            previewDialogVisible: false,
            editDialogVisible: false,
            newCommentTemplate: {
                name: "",
                entry: [{ value: "" }],
            },
            newTemplateSubmitting: false,
            loading: true,
            previewData: [],
            editData: {
                _id: "",
                name: "",
                entry: [{ value: "" }],
            },
            editSubmitting: false,
        };
    },
    methods: {
        getAllCommentTemplate() {
            this.loading = true;
            getAllCommentTemplate({ courseID: this.courseId }).then((res) => {
                console.log(res.data);
                let rowTeamplate = res.data.commentTemplate;
                this.transformTemplateData(rowTeamplate);
            });
        },
        transformTemplateData(data) {
            let tableData = [];
            for (let template of data) {
                let entry = template.template;
                let item = {};
                for (let i = 0; i < entry.length; i++) {
                    item = {
                        name: template.name,
                        title: entry[i].entry,
                    };
                    if (i === 0) {
                        item.length = entry.length;
                        item._id = template._id;
                    }
                    tableData.push(item);
                }
            }
            console.log(tableData);
            this.commentTemplate = tableData;
            this.loading = false;
        },
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 0 || columnIndex === 2) {
                if (row.length) {
                    return {
                        rowspan: row.length,
                        colspan: 1,
                    };
                } else {
                    return [0, 0];
                }
            }
        },
        submitTemplate(formName) {
            this.newCommentTemplate.name = this.newCommentTemplate.name.trim();
            this.newCommentTemplate.entry.forEach((e) => {
                e.value = e.value.trim();
            });
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.newTemplateSubmitting = true;
                    let temp = Object.assign({}, this.newCommentTemplate);
                    let entry = temp.entry.map((e) => {
                        return e.value;
                    });
                    temp.entry = entry;

                    submitNewCommentTemplate({
                        courseID: this.courseId,
                        template: temp,
                    })
                        .then(() => {
                            this.$message({
                                type: "success",
                                message: "添加模板成功",
                            });
                            this.newTemplateSubmitting = false;
                            this.getAllCommentTemplate();
                            this.resetTemplate("newCommentTemplate");
                            this.createTeamplateDialogVisible = false;
                        })
                        .catch(() => {
                            this.newTemplateSubmitting = false;
                        });
                } else {
                    this.$message({
                        message: "请将信息填写完整",
                        type: "warning",
                    });
                }
            });
        },
        inEditSubmitTemplate(formName) {
            this.editData.name = this.editData.name.trim();
            this.editData.entry.forEach((e) => {
                e.value = e.value.trim();
            });
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.editSubmitting = true;
                    let temp = Object.assign({}, this.editData);
                    let entry = temp.entry.map((e) => {
                        return e.value;
                    });
                    temp.entry = entry;

                    editCommentTemplate({
                        courseID: this.courseId,
                        template: temp,
                    })
                        .then(() => {
                            this.$message({
                                type: "success",
                                message: "修改成功",
                            });
                            this.editSubmitting = false;
                            this.getAllCommentTemplate();
                            this.editDialogVisible = false;
                        })
                        .catch(() => {
                            this.editSubmitting = false;
                        });
                } else {
                    this.$message({
                        message: "请将信息填写完整",
                        type: "warning",
                    });
                }
            });
        },
        resetTemplate(formName) {
            this.$refs[formName].resetFields();
            this.newCommentTemplate = {
                name: "",
                entry: [{ value: "" }],
            };
        },
        removeEntry(item) {
            let index = this.newCommentTemplate.entry.indexOf(item);
            if (index !== -1) {
                this.newCommentTemplate.entry.splice(index, 1);
            }
        },
        inEditRemoveEntry(item) {
            let index = this.editData.entry.indexOf(item);
            if (index !== -1) {
                this.editData.entry.splice(index, 1);
            }
        },
        addEntry() {
            this.newCommentTemplate.entry.push({
                value: "",
                key: Date.now(),
            });
        },
        inEditAddEntry() {
            this.editData.entry.push({
                value: "",
                key: Date.now(),
            });
        },
        preview(_id) {
            let tData = this.commentTemplate;
            for (let i = 0; i < tData.length; i++) {
                if (tData[i]._id === _id) {
                    this.previewData = tData.slice(i, i + tData[i].length);
                    break;
                }
            }
            this.previewDialogVisible = !this.previewDialogVisible;
        },
        edit(_id) {
            let tData = this.commentTemplate;
            let editData = [];
            let name = "";
            for (let i = 0; i < tData.length; i++) {
                if (tData[i]._id === _id) {
                    editData = tData.slice(i, i + tData[i].length);
                    this.editData._id = _id;
                    name = tData[i].name;
                    console.log(this.editData);
                    break;
                }
            }
            let formartEditData = editData.map((e) => {
                return {
                    value: e.title,
                    key: e.title + Date.now(),
                };
            });
            this.editData.entry = formartEditData;
            this.editData.name = name;
            this.editDialogVisible = !this.editDialogVisible;
        },
    },
};
</script>

<style lang="scss" scoped>
.new-template-footbar {
    display: flex;
}
</style>
