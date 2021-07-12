<template>
    <div style="padding-top: 15px">
        <div class="toolbar">
            <el-button
                type="primary"
                class="filter-item"
                icon="el-icon-plus"
                @click="handleAddGroupVisible"
                >添加组</el-button
            >
            <span class="infoLabel"
                >本课程共 {{ studentNumber }} 名学生，
                {{ groupedStudentNumber }} 名已分组</span
            >
        </div>
        <el-table
            :data="group"
            :span-method="objectSpanMethod"
            border
            style="width: 100%; margin-top: 20px"
            v-loading="loading"
        >
            <el-table-column type="index" width="50" label="序号">
            </el-table-column>
            <el-table-column
                prop="name"
                label="组名"
                width="240"
                align="center"
            >
            </el-table-column>
            <el-table-column prop="member" label="成员"> </el-table-column>
            <el-table-column label="操作" align="center" width="360">
                <template slot-scope="scope">
                    <emit-message-button :uid="scope.row._id" />
                    <el-button type="primary" @click="edit(scope.row._id)"
                        ><i class="el-icon-edit" />&nbsp;编辑</el-button
                    >
                    <el-button
                        type="danger"
                        :disabled="deleteSubmitting"
                        @click="deleteCommentTemplate(scope.row._id)"
                        ><i class="el-icon-delete" />&nbsp;删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>
        <el-dialog title="添加组" :visible.sync="addGroupVisible">
            <div
                style="text-align: center"
                v-loading="unGroupedStudentsLoading"
            >
                <el-transfer
                    style="text-align: left; display: inline-block"
                    v-model="groupMenbers"
                    filterable
                    :filter-method="unGroupedStudentSearch"
                    filter-placeholder="请输入学号或姓名"
                    :titles="['未分组学生', '目标组']"
                    @change="handleChange"
                    :format="{
                        noChecked: '${total}',
                        hasChecked: '${checked}/${total}',
                    }"
                    :data="unGroupedStudents"
                >
                    <span slot-scope="{ option }">
                        <span :title="option.username">
                            {{ option.name }}
                        </span>
                    </span>

                    <span slot="right-footer">
                        <div class="transfer-right-footer">
                            <el-button
                                size="small"
                                type="primary"
                                class="button"
                                @click="submitNewGroup"
                                >创建组</el-button
                            >
                        </div>
                    </span>
                </el-transfer>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import EmitMessageButton from "@/components/EmitMessageButton";
import { getGroup, getUnGroupedStudents } from "@/api/course";
export default {
    name: "ManageCourseGroup",
    props: ["courseId"],
    components: { EmitMessageButton },
    data() {
        return {
            group: [],
            loading: false,
            deleteSubmitting: false,
            addGroupVisible: false,
            groupMenbers: [],
            unGroupedStudents: [],
            unGroupedStudentsLoading: false,
            studentNumber: 0,
            groupedStudentNumber: 0,
        };
    },
    created() {
        this.getGroup();
    },
    methods: {
        handleAddGroupVisible() {
            this.addGroupVisible = true;
            this.unGroupedStudentsLoading = true;
            getUnGroupedStudents({ courseID: this.courseId }).then((res) => {
                let { unGroupedStudents } = res.data;
                let students = unGroupedStudents.map((e) => {
                    return {
                        key: e._id,
                        _id: e._id,
                        name: e.name,
                        username: e.username,
                    };
                });
                this.unGroupedStudents = students;
                this.unGroupedStudentsLoading = false;
            });
        },
        objectSpanMethod() {},
        handleChange() {},
        getGroup() {
            this.loading = true;
            getGroup({ courseID: this.courseId }).then((res) => {
                let { studentNumber, group } = res.data;
                this.studentNumber = studentNumber;
                this.transformGroupData(group);
                this.loading = false;
            });
        },
        transformGroupData(raw) {},
        unGroupedStudentSearch(query, item) {
            if (
                item.username.indexOf(query) !== -1 ||
                item.name.indexOf(query) !== -1
            ) {
                return item;
            }
        },
        submitNewGroup() {},
    },
};
</script>

<style lang='scss' scoped>
.toolbar {
    display: flex;

    .infoLabel {
        margin-left: auto;
        line-height: 36px;
        color: #909399;
    }
}

.transfer-right-footer {
    display: flex;
    padding: 4px;
    justify-content: center;
    .button {
        margin-left: auto;
    }
}
</style>
