<template>
  <div style="padding-top: 15px">
    <div class="toolbar">
      <el-button
        type="primary"
        class="filter-item"
        icon="el-icon-plus"
        @click="handleAddGroupVisible"
      >
        添加组
      </el-button>
      <!--  <el-button
                type="primary"
                class="filter-item"
                icon="el-icon-message"
                @click="handleSendMessagesToSelectedGroup"
            >
                向选中组发送私信
            </el-button> -->
      <span class="info">
        本课程共 {{ studentNumber }} 名学生， {{ groupedStudentNumber }} 名已分组
      </span>

      <span class="right-panel">
        <el-switch v-model="editAndDeleteActive" active-text="启用编辑" />
      </span>
    </div>
    <el-table
      v-loading="loading"
      :data="group"
      :span-method="objectSpanMethod"
      border
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column width="50" label="序号" prop="index" align="center" />
      <el-table-column prop="groupName" label="组名" width="240" align="center" />
      <el-table-column prop="username" label="学号" align="center" />
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column v-if="editAndDeleteActive" label="操作" align="center">
        <template slot-scope="scope">
          <!-- <el-button icon="el-icon-message">发送私信</el-button> -->

          <el-button
            v-if="editAndDeleteActive"
            type="primary"
            @click="edit(scope.row.groupID)"
          >
            <i class="el-icon-edit" />
            &nbsp;编辑
          </el-button>
          <el-button
            v-if="editAndDeleteActive"
            type="danger"
            :disabled="deleteSubmitting"
            @click="deleteGroup(scope.row)"
          >
            <i class="el-icon-delete" />
            &nbsp;删除
          </el-button>
          <span v-else style="font-size: 12px; color: grey">请先启用编辑</span>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="添加组" :visible.sync="addGroupVisible">
      <div v-loading="sourceStudentsLoading" style="text-align: center">
        <el-form>
          <el-row>
            <el-col><el-form-item>建议将组长放在首位</el-form-item></el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item>
                <el-transfer
                  v-model="targetGroup.groupMembersID"
                  style="text-align: left; display: inline-block"
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
                <div style="display: flex; justify-content: center">
                  <div style="width: 582px; display: flex">
                    <div style="margin-left: auto">
                      <el-input
                        v-model="targetGroup.name"
                        style="width: 132px; height: 32px"
                        placeholder="组名（非必需）"
                      />
                      <el-button
                        type="primary"
                        size="small"
                        class="button"
                        :loading="newGroupSubmitting"
                        :disabled="targetGroup.groupMembersID.length === 0"
                        @click="submitNewGroup"
                      >
                        创建组
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-dialog>
    <el-dialog title="编辑组" :visible.sync="editGroupVisible" :close-on-click-modal="false">
      <div v-loading="sourceStudentsLoading" style="text-align: center">
        <el-form>
          <el-row>
            <el-col><el-form-item>建议将组长放在首位</el-form-item></el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item>
                <el-transfer
                  v-model="editGroup.groupMembersID"
                  style="text-align: left; display: inline-block"
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
                <div style="display: flex; justify-content: center">
                  <div style="width: 582px; display: flex">
                    <div style="margin-left: auto">
                      <el-input
                        v-model="editGroup.name"
                        style="width: 144px; height: 32px"
                        placeholder="组名（非必需）"
                      />
                      <el-button
                        type="primary"
                        size="small"
                        class="button"
                        :loading="editGroupSubmitting"
                        :disabled="editGroup.groupMembersID.length === 0"
                        @click="submitEditGroup"
                      >
                        提交
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-dialog>
    <el-dialog title="删除组" :visible.sync="deleteGroupVisible" width="30%">
      <span style="display: flex; flex-direction: column">
        <span style="display: flex; align-items: center">
          <i class="el-icon-warning" />
          <p style="color: #606266; line-height: 24px">
            确认删除此组？删除后该组以往提交的成果不受影响。
            如果确定要删除此组，请输入组员姓名
            <b>{{ deleteConfirm.source }}</b>
          </p>
        </span>
        <span style="margin-left: 36px">
          <el-input v-model="deleteConfirm.input" />
        </span>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteGroupVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :disabled="deleteConfirm.source !== deleteConfirm.input"
          :loading="deleteSubmitting"
          @click="submitDelete"
        >
          确 定
        </el-button>
      </span>
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
    deleteGroup
} from '@/api/course'

export default {
    name: 'ManageCourseGroup',
    props: {
        courseId: String
    },
    data() {
        return {
            group: [],
            loading: false,
            deleteSubmitting: false,
            newGroupSubmitting: false,
            editGroupSubmitting: false,
            addGroupVisible: false,
            editGroupVisible: false,
            deleteGroupVisible: false,
            targetGroup: {
                name: '',
                groupMembersID: []
            },
            editGroup: {
                _id: '',
                name: '',
                groupMembersID: []
            },
            sourceStudents: [],
            editSourceStudents: [],
            editUnGroupedStudents: [],
            sourceStudentsLoading: false,
            studentNumber: 0,
            groupedStudentNumber: 0,
            spanList: new Set([0, 1, 4]),
            editAndDeleteActive: false,
            deleteConfirm: {
                source: '',
                input: '',
                _id: ''
            }
        }
    },
    created() {
        this.getGroup()
    },
    methods: {
        handleAddGroupVisible() {
            this.addGroupVisible = true
            this.getUnGroupedStudents()
        },
        // 编辑组时，获取未分组及本组学生
        edit(groupID) {
            this.editGroupVisible = true
            this.getEditData(groupID)
        },
        getEditData(groupID) {
            this.sourceStudentsLoading = true
            getEditData({ courseID: this.courseId, groupID: groupID })
                .then(res => {
                    const { editSourceData, groupMembersID, groupName } = res.data
                    const students = editSourceData.map(e => {
                        return {
                            key: e._id,
                            _id: e._id,
                            name: e.name,
                            username: e.username
                        }
                    })
                    this.editGroup._id = groupID
                    this.editSourceStudents = students
                    this.editGroup.groupMembersID = groupMembersID
                    this.editGroup.name = groupName
                    this.sourceStudentsLoading = false
                })
                .catch(() => {
                    this.editGroupVisible = false
                    this.getGroup()
                })
        },
        // 新建组时，获取未分组学生
        getUnGroupedStudents() {
            this.sourceStudentsLoading = true
            getUnGroupedStudents({ courseID: this.courseId }).then(res => {
                const { unGroupedStudents } = res.data
                const students = unGroupedStudents.map(e => {
                    return {
                        key: e._id,
                        _id: e._id,
                        name: e.name,
                        username: e.username
                    }
                })
                this.sourceStudents = students
                this.sourceStudentsLoading = false
            })
        },
        // 表合并
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (this.spanList.has(columnIndex)) {
                if (row.length) {
                    return {
                        rowspan: row.length,
                        colspan: 1
                    }
                } else {
                    return [0, 0]
                }
            }
        },
        getGroup() {
            this.loading = true
            getGroup({ courseID: this.courseId }).then(res => {
                const { studentNumber, group } = res.data
                this.studentNumber = studentNumber
                this.transformGroupData(group)
                this.loading = false
            })
        },
        transformGroupData(raw) {
            const tableData = []
            let index = 0
            for (const group of raw) {
                const groupMember = group.groupMember

                for (let i = 0; i < groupMember.length; i++) {
                    const member = groupMember[i]
                    const item = {
                        _id: member._id,
                        name: member.name,
                        username: member.username
                    }
                    if (i === 0) {
                        item.length = groupMember.length
                        item.groupName = group.name || '无'
                        item.groupID = group._id
                        index++
                        item.index = index
                    }

                    tableData.push(item)
                }
            }
            this.groupedStudentNumber = tableData.length
            this.group = tableData
        },
        studentSearch(query, item) {
            if (item.username.indexOf(query) !== -1 || item.name.indexOf(query) !== -1) {
                return item
            }
        },
        submitNewGroup() {
            if (this.targetGroup.groupMembersID.length > 0) {
                this.newGroupSubmitting = true
                submitNewGroup({
                    courseID: this.courseId,
                    targetGroup: this.targetGroup
                })
                    .then(() => {
                        this.targetGroup = { name: '', groupMembersID: [] }
                        this.$message({
                            type: 'success',
                            message: '创建新组成功'
                        })
                        this.newGroupSubmitting = false
                        this.unGroupedStudents = []
                        this.getUnGroupedStudents()
                        this.getGroup()
                    })
                    .catch(() => {
                        this.newGroupSubmitting = false
                        this.getUnGroupedStudents()
                        this.getGroup()
                    })
            }
        },
        submitEditGroup() {
            if (this.editGroup.groupMembersID.length > 0) {
                this.editGroupSubmitting = true
                submitEditGroup({
                    courseID: this.courseId,
                    targetGroup: this.editGroup
                })
                    .then(() => {
                        this.$message({
                            type: 'success',
                            message: '编辑成功'
                        })
                        this.unGroupedStudents = []
                        this.getGroup()
                        this.editGroupSubmitting = false
                        this.editGroupVisible = false
                    })
                    .catch(() => {
                        this.editGroupSubmitting = false
                        this.getEditData(this.editGroup._id)
                        this.getGroup()
                    })
            }
        },
        deleteGroup(group) {
            this.deleteGroupVisible = true
            this.deleteConfirm.source = group.name
            this.deleteConfirm._id = group.groupID
        },
        submitDelete() {
            this.deleteSubmitting = true
            deleteGroup({
                courseID: this.courseId,
                groupID: this.deleteConfirm._id
            })
                .then(() => {
                    this.deleteSubmitting = false
                    this.deleteGroupVisible = false
                    this.deleteConfirm = {
                        source: '',
                        input: '',
                        _id: ''
                    }
                    this.$message({
                        type: 'success',
                        message: '删除成功'
                    })
                    this.getGroup()
                })
                .catch(() => {
                    this.deleteSubmitting = false
                })
        },
        handleSendMessagesToSelectedGroup() {}
    }
}
</script>

<style lang="scss" scoped>
.toolbar {
    display: flex;
    align-items: center;
    line-height: 36px;

    .right-panel {
        margin-left: auto;
        display: flex;
    }
    .info {
        margin-left: 16px;
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
.el-icon-warning {
    color: #e6a23c;
    font-size: 24px;
    margin-right: 12px;
}
</style>
