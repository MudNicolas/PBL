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
            <el-button
                type="primary"
                class="filter-item"
                icon="el-icon-message-solid"
                @click="handleSendMessagesToSelectedGroup"
                >向选中组发送私信</el-button
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
            <el-table-column type="selection" width="55"> </el-table-column>

            <el-table-column type="index" width="50" label="序号">
            </el-table-column>
            <el-table-column
                prop="groupName"
                label="组名"
                width="240"
                align="center"
            >
            </el-table-column>
            <el-table-column prop="username" label="学号"> </el-table-column>
            <el-table-column prop="name" label="姓名"> </el-table-column>
            <el-table-column label="操作" align="center" width="360">
                <template slot-scope="scope">
                    <el-button type="primary" @click="edit(scope.row.groupID)"
                        ><i class="el-icon-edit" />&nbsp;编辑</el-button
                    >
                    <el-button
                        type="danger"
                        :disabled="deleteSubmitting"
                        @click="deleteGroup(scope.row.groupID)"
                        ><i class="el-icon-delete" />&nbsp;删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>
        <el-dialog title="添加组" :visible.sync="addGroupVisible">
            <div style="text-align: center" v-loading="sourceStudentsLoading">
                <el-form>
                    <el-row>
                        <el-col>
                            <el-form-item>
                                <el-transfer
                                    style="
                                        text-align: left;
                                        display: inline-block;
                                    "
                                    v-model="targetGroup.groupMembersID"
                                    filterable
                                    :filter-method="studentSearch"
                                    filter-placeholder="请输入学号或姓名"
                                    :titles="['未分组学生', '目标组']"
                                    :format="{
                                        noChecked: '${total}',
                                        hasChecked: '${checked}/${total}',
                                    }"
                                    :data="sourceStudents"
                                    target-order="push"
                                >
                                    <span slot-scope="{ option }">
                                        <span :title="option.username">
                                            {{ option.name }}
                                        </span>
                                    </span>
                                </el-transfer>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>
                            <el-form-item>
                                <div
                                    style="
                                        display: flex;
                                        justify-content: center;
                                    "
                                >
                                    <div style="width: 582px; display: flex">
                                        <div style="margin-left: auto">
                                            <el-input
                                                v-model="targetGroup.name"
                                                style="
                                                    width: 132px;
                                                    height: 32px;
                                                "
                                                placeholder="组名（非必需）"
                                            />
                                            <el-button
                                                type="primary"
                                                size="small"
                                                class="button"
                                                @click="submitNewGroup"
                                                :loading="newGroupSubmitting"
                                                :disabled="
                                                    targetGroup.groupMembersID
                                                        .length === 0
                                                "
                                                >创建组</el-button
                                            >
                                        </div>
                                    </div>
                                </div>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </div>
        </el-dialog>
        <el-dialog title="编辑组" :visible.sync="editGroupVisible">
            <div style="text-align: center" v-loading="sourceStudentsLoading">
                <el-form>
                    <el-row>
                        <el-col>
                            <el-form-item>
                                <el-transfer
                                    style="
                                        text-align: left;
                                        display: inline-block;
                                    "
                                    v-model="editGroup.groupMembersID"
                                    filterable
                                    :filter-method="studentSearch"
                                    filter-placeholder="请输入学号或姓名"
                                    :titles="['未分组学生', '目标组']"
                                    :format="{
                                        noChecked: '${total}',
                                        hasChecked: '${checked}/${total}',
                                    }"
                                    :data="editSourceStudents"
                                    target-order="push"
                                >
                                    <span slot-scope="{ option }">
                                        <span :title="option.username">
                                            {{ option.name }}
                                        </span>
                                    </span>
                                </el-transfer>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>
                            <el-form-item>
                                <div
                                    style="
                                        display: flex;
                                        justify-content: center;
                                    "
                                >
                                    <div style="width: 582px; display: flex">
                                        <div style="margin-left: auto">
                                            <el-input
                                                v-model="editGroup.name"
                                                style="
                                                    width: 132px;
                                                    height: 32px;
                                                "
                                                placeholder="组名（非必需）"
                                            />
                                            <el-button
                                                type="primary"
                                                size="small"
                                                class="button"
                                                @click="submitEditGroup"
                                                :loading="editGroupSubmitting"
                                                :disabled="
                                                    editGroup.groupMembersID
                                                        .length === 0
                                                "
                                                >提交</el-button
                                            >
                                        </div>
                                    </div>
                                </div>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {
    getGroup,
    getUnGroupedStudents,
    submitNewGroup,
    getEditData,
    submitEditGroup,
    deleteGroup,
} from "@/api/course";
export default {
    name: "ManageCourseGroup",
    props: ["courseId"],
    data() {
        return {
            group: [],
            loading: false,
            deleteSubmitting: false,
            newGroupSubmitting: false,
            editGroupSubmitting: false,
            addGroupVisible: false,
            editGroupVisible: false,
            targetGroup: {
                name: "",
                groupMembersID: [],
            },
            editGroup: {
                _id: "",
                name: "",
                groupMembersID: [],
            },
            sourceStudents: [],
            editSourceStudents: [],
            editUnGroupedStudents: [],
            sourceStudentsLoading: false,
            studentNumber: 0,
            groupedStudentNumber: 0,
            spanList: new Set([0, 1, 2, 5]),
        };
    },
    created() {
        this.getGroup();
    },
    methods: {
        handleAddGroupVisible() {
            this.addGroupVisible = true;
            this.getUnGroupedStudents();
        },
        //编辑组时，获取未分组及本组学生
        edit(groupID) {
            this.editGroupVisible = true;
            this.sourceStudentsLoading = true;
            getEditData({ courseID: this.courseId, groupID: groupID }).then(
                (res) => {
                    let { editSourceData, groupMembersID, groupName } =
                        res.data;
                    let students = editSourceData.map((e) => {
                        return {
                            key: e._id,
                            _id: e._id,
                            name: e.name,
                            username: e.username,
                        };
                    });
                    this.editGroup._id = row.groupID;
                    this.editSourceStudents = students;
                    this.editGroup.groupMembersID = groupMembersID;
                    this.editGroup.name = groupName;
                    this.sourceStudentsLoading = false;
                }
            );
        },
        //新建组时，获取未分组学生
        getUnGroupedStudents() {
            this.sourceStudentsLoading = true;
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
                this.sourceStudents = students;
                this.sourceStudentsLoading = false;
            });
        },
        //表合并
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (this.spanList.has(columnIndex)) {
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
        getGroup() {
            this.loading = true;
            getGroup({ courseID: this.courseId }).then((res) => {
                let { studentNumber, group } = res.data;
                this.studentNumber = studentNumber;
                this.transformGroupData(group);
                this.loading = false;
            });
        },
        transformGroupData(raw) {
            console.log(raw);
            let tableData = [];
            for (let group of raw) {
                let groupMember = group.groupMember;
                for (let i = 0; i < groupMember.length; i++) {
                    let member = groupMember[i];
                    let item = {
                        _id: member._id,
                        name: member.name,
                        username: member.username,
                    };
                    if (i === 0) {
                        item.length = groupMember.length;
                        item.groupName = group.name || "无";
                        item.groupID = group._id;
                    }
                    tableData.push(item);
                }
            }
            this.groupedStudentNumber = tableData.length;
            this.group = tableData;
        },
        studentSearch(query, item) {
            if (
                item.username.indexOf(query) !== -1 ||
                item.name.indexOf(query) !== -1
            ) {
                return item;
            }
        },
        submitNewGroup() {
            if (this.targetGroup.groupMembersID.length > 0) {
                this.newGroupSubmitting = true;
                submitNewGroup({
                    courseID: this.courseId,
                    targetGroup: this.targetGroup,
                })
                    .then(() => {
                        this.targetGroup = { name: "", groupMembersID: [] };
                        this.$message({
                            type: "success",
                            message: "创建新组成功",
                        });
                        this.newGroupSubmitting = false;
                        this.unGroupedStudents = [];
                        this.getUnGroupedStudents();
                        this.getGroup();
                    })
                    .catch(() => {
                        this.newGroupSubmitting = false;
                        this.getUnGroupedStudents();
                        this.getGroup();
                    });
            }
        },
        submitEditGroup() {
            if (this.editGroup.groupMembersID.length > 0) {
                this.editGroupSubmitting = true;
                submitEditGroup({
                    courseID: this.courseId,
                    targetGroup: this.editGroup,
                })
                    .then((res) => {
                        this.$message({
                            type: "success",
                            message: "编辑成功",
                        });
                        this.unGroupedStudents = [];
                        this.getGroup();
                        this.editGroupSubmitting = false;
                        this.editGroupVisible = false;
                    })
                    .catch(() => {
                        this.editGroupSubmitting = false;
                        this.edit();
                        this.getGroup();
                    });
            }
        },
        deleteGroup(groupID) {
            this.$confirm("确认删除此组？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                beforeClose: (action, instance, done) => {
                    if (action === "confirm") {
                        instance.confirmButtonLoading = true;
                        this.deleteSubmitting = true;
                        deleteGroup({
                            courseID: this.courseId,
                            groupID: groupID,
                        })
                            .then(() => {
                                this.deleteSubmitting = false;
                                instance.confirmButtonLoading = false;
                                this.$message({
                                    type: "success",
                                    message: "删除成功",
                                });
                                this.getGroup();
                                done();
                            })
                            .catch(() => {
                                this.deleteSubmitting = false;
                                instance.confirmButtonLoading = false;
                                done();
                            });
                    } else {
                        done();
                    }
                },
            }).catch(() => {});
        },
        handleSendMessagesToSelectedGroup() {},
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
