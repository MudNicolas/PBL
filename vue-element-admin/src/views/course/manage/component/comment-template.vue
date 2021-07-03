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
                    <el-button @click="preview(scope.row)"
                        ><i class="el-icon-view" />&nbsp;预览</el-button
                    >
                    <el-button type="primary"
                        ><i class="el-icon-edit" />&nbsp;编辑</el-button
                    >
                    <el-button type="danger"
                        ><i class="el-icon-delete" />&nbsp;删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>
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
                                    @click="
                                        submitTemplate('newCommentTemplate')
                                    "
                                    >提交新模板</el-button
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
import { getAllCommentTemplate } from "@/api/course";
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
            newCommentTemplate: {
                name: "",
                entry: [{ value: "" }],
            },
        };
    },
    methods: {
        getAllCommentTemplate() {
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
                    }
                    tableData.push(item);
                }
            }
            console.log(tableData);
            this.commentTemplate = tableData;
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
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    console.log(this.newCommentTemplate);
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
            var index = this.newCommentTemplate.entry.indexOf(item);
            if (index !== -1) {
                this.newCommentTemplate.entry.splice(index, 1);
            }
        },
        addEntry() {
            this.newCommentTemplate.entry.push({
                value: "",
                key: Date.now(),
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.new-template-footbar {
    display: flex;
}
</style>
