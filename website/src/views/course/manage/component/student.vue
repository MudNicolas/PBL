<template>
  <div style="padding-top: 15px">
    <div class="toolbar">
      <el-button
        type="primary"
        class="filter-item"
        icon="el-icon-upload2"
        @click="dialogVisible = true"
      >
        导入学生
      </el-button>
      <el-button
        type="primary"
        class="filter-item"
        icon="el-icon-document"
        :loading="exporting"
        @click="handleExport"
      >
        导出Excel
      </el-button>

      <span class="right-panel">
        <el-switch v-model="editActive" active-text="启用编辑" />
      </span>
    </div>

    <el-table
      v-loading="loading"
      :data="
        studentList.filter(
          data => !search || data.name.includes(search) || data.username.includes(search)
        )
      "
      highlight-current-row
      style="width: 100%; margin-top: 20px"
      empty-text="暂无学生"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="username" label="学号" sortable />
      <el-table-column label="姓名">
        <template slot-scope="scope">
          <el-popover
            placement="left"
            trigger="hover"
            :open-delay="popoverOpenDelay"
            width="360"
            @show="showUpPopoverKey = scope.row._id"
          >
            <div>
              <profile-popover
                :uid="scope.row._id"
                :show-up-popover-key="showUpPopoverKey"
              />
            </div>
            <span slot="reference">{{ scope.row.name }}</span>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column align="right">
        <template slot="header" slot-scope="{}">
          <el-input
            v-model="search"
            :placeholder="'输入学号或姓名搜索共 ' + studentList.length + ' 名学生'"
          />
        </template>

        <template slot-scope="scope">
          <!-- <el-button icon="el-icon-message">发送私信</el-button> -->

          <el-button v-if="editActive" type="danger" @click="removeStudent(scope.row)">
            <i class="el-icon-delete" />
            &nbsp;移出课程
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="导入学生" :visible.sync="dialogVisible">
      <el-form>
        <el-row>
          <el-col>
            <el-form-item style="margin-bottom: 0px">
              <upload-excel-component
                :on-success="handleSuccess"
                :before-upload="beforeUpload"
                :info-text="infoText"
                :t-header="['学号', '姓名']"
                :filter-val="['id', 'name']"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col>
            <el-form-item>
              <el-table
                :data="uploadStudentList"
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
          <el-button style="margin-left: auto" @click="cancel">取消</el-button>
          <el-button
            type="primary"
            :disabled="uploadStudentList.length === 0"
            :loading="submitting"
            @click="handleSubmit"
          >
            导入
          </el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { getStudentList, submitStudentList, handleRemoveStudent } from '@/api/course'
import UploadExcelComponent from '@/components/UploadExcel/index.vue'
import ProfilePopover from '@/components/ProfilePopover/profile-popover.vue'

export default {
    name: 'ManageStudent',
    components: { UploadExcelComponent, ProfilePopover },
    props: {
        courseId: String
    },
    data() {
        return {
            studentList: [],
            tableHeader: ['学号', '姓名', '头像', '操作'],
            uploadTableHeader: ['学号', '姓名'],
            loading: true,
            path: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            search: '',
            exporting: false,
            course: {
                name: ''
            },
            infoText: '导入学生，将Excel文件拖到此处，或',
            uploadStudentList: [],
            dialogVisible: false,
            amount: 0,
            submitting: false,
            popoverOpenDelay: 200,
            studentSelection: [],
            multiMessage: false,
            showUpPopoverKey: '',
            editActive: false
        }
    },

    created() {
        this.getStudentList()
    },
    methods: {
        getStudentList() {
            this.loading = true
            getStudentList({ courseID: this.courseId }).then(res => {
                const { data } = res
                this.studentList = data.studentList
                this.course.name = data.courseName
                this.loading = false
            })
        },

        handleExport() {
            this.exporting = true
            import('@/vendor/Export2Excel')
                .then(excel => {
                    const tHeader = ['学号', '姓名']
                    const filterVal = ['username', 'name']
                    const list = this.studentList
                    const data = this.formatJson(filterVal, list)
                    excel.export_json_to_excel({
                        header: tHeader,
                        data,
                        filename: this.course.name + ' - 学生数据',
                        autoWidth: true,
                        bookType: 'xlsx'
                    })

                    this.exporting = false
                })
                .catch(e => {
                    this.$message({
                        type: 'warning',
                        message: e
                    })
                })
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => v[j]))
        },
        beforeUpload(file) {
            const isLt1M = file.size / 1024 / 1024 < 1

            if (isLt1M) {
                return true
            }

            this.$message({
                message: '文件大小限制1MB',
                type: 'warning'
            })
            return false
        },
        handleSuccess({ results }) {
            // console.log(results);
            // 判断文件是否符合规范
            if (!results[0] || !results[0]['学号'] || !results[0]['姓名']) {
                this.$message({
                    type: 'warning',
                    message: '文件错误，请遵循模板格式填入信息！'
                })
                return
            }
            // 判断重复
            const studentNum = []
            results.forEach(e => {
                // 数组中已有这个学号
                e['学号'] = (e['学号'] || '').toString().trim()
                e['姓名'] = (e['姓名'] || '').toString().trim()
                if (e['学号'] === '' || e['姓名'] === '') {
                    this.$message({
                        type: 'warning',
                        message: '文件中存在学生学号或姓名为空！'
                    })
                    this.course.studentList = []
                    return
                }
                if (studentNum.indexOf(e['学号']) !== -1) {
                    this.$message({
                        type: 'warning',
                        message: '文件中学生学号存在重复，请检查学生数据'
                    })
                    this.course.studentList = []
                    return
                }
                studentNum.push(e['学号'])
            })

            this.amount = results.length
            if (this.amount === studentNum.length) {
                // console.log(studentNum);
                this.uploadStudentList = results.map(e => ({ 学号: e['学号'], 姓名: e['姓名'] }))
            }
        },
        cancel() {
            this.dialogVisible = false
        },
        handleSubmit() {
            this.submitting = true
            submitStudentList({
                studentList: this.uploadStudentList,
                courseID: this.courseId
            })
                .then(() => {
                    this.$message({
                        type: 'success',
                        message: '导入学生成功'
                    })
                    this.dialogVisible = false
                    this.getStudentList()
                    this.uploadStudentList = []
                    this.submitting = false
                })
                .catch(() => {
                    this.submitting = false
                })
        },
        handleSelectionChange(val) {
            const selectedUID = val.map(e => {
                return e._id
            })
            this.studentSelection = selectedUID
        },
        handleSendMessagesToSelectedStudent() {
            console.log(this.studentSelection)
            if (this.studentSelection.length === 0) {
                this.$message({
                    type: 'warning',
                    message: '请至少选择一项'
                })
                return
            }
        },
        removeStudent(student) {
            const { _id, name } = student

            this.$confirm(`确定将${name}移出本课程？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: (action, instance, done) => {
                    if (action === 'confirm') {
                        instance.confirmButtonLoading = true
                        handleRemoveStudent({ _id, courseID: this.courseId })
                            .then(() => {
                                this.$message.success('移除成功')
                                instance.confirmButtonLoading = false
                                this.infoDialogVisible = false
                                this.getStudentList()
                                done()
                            })
                            .catch(() => {
                                instance.confirmButtonLoading = false
                                done()
                            })
                    } else {
                        done()
                    }
                }
            }).catch(err => {
                console.log(err)
            })
        }
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
}
</style>
