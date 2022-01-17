<template>
  <div>
    <div>
      <el-button
        type="primary"
        class="filter-item"
        icon="el-icon-upload2"
        @click="dialogVisible = true"
      >
        导入{{ roleLabel[role] }}
      </el-button>
      <el-autocomplete
        v-model="searchQuery"
        style="float: right"
        :fetch-suggestions="remoteUserSearch"
        placeholder="搜索"
        :trigger-on-focus="false"
        @select="handleSelect"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-autocomplete>
    </div>

    <el-table
      v-loading="loading"
      style="width: 100%; margin-top: 20px"
      :data="users"
      border
      highlight-current-row
    >
      <el-table-column prop="username" :label="usernameLabel[role]" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column label="头像">
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
            <span slot="reference">
              <el-avatar :src="avatarPath + scope.row.avatar" />
            </span>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="primary" @click="showInfo(scope.row._id)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      style="padding-top: 10px; margin-top: 10px"
      :total="userNum"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      :page-sizes="[20, 30, 50, 80, 100]"
      @pagination="pagination"
    />
    <el-dialog :title="`导入${roleLabel[role]}`" :visible.sync="dialogVisible">
      <el-form>
        <el-row>
          <el-col>
            <el-form-item style="margin-bottom: 0px">
              <upload-excel-component
                :on-success="handleSuccess"
                :before-upload="beforeUpload"
                :info-text="infoText"
                :t-header="[usernameLabel[role], '姓名']"
                :filter-val="['id', 'name']"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col>
            <el-form-item>
              <el-table
                :data="uploadUserList"
                border
                highlight-current-row
                style="width: 100%; margin-top: 20px"
              >
                <el-table-column
                  prop="username"
                  :label="usernameLabel[role]"
                  sortable
                />
                <el-table-column prop="name" label="姓名" />
              </el-table>
            </el-form-item>
          </el-col>
        </el-row>
        <div style="display: flex">
          <el-button style="margin-left: auto" @click="cancel">取消</el-button>
          <el-button
            type="primary"
            :disabled="uploadUserList.length === 0"
            :loading="submitting"
            @click="handleSubmit"
          >
            导入
          </el-button>
        </div>
      </el-form>
    </el-dialog>
    <el-dialog title="详情" :visible.sync="infoVisible" @closed="clearInfo">
      <el-form v-if="userInfo.user && userInfo.user._id">
        <el-form-item>
          <el-descriptions direction="vertical" border>
            <el-descriptions-item label="用户名">
              {{ userInfo.user.username }}
            </el-descriptions-item>
            <el-descriptions-item label="姓名">
              {{ userInfo.user.name }}
            </el-descriptions-item>
            <el-descriptions-item label="头像">
              <el-avatar :src="avatarPath + userInfo.user.avatar" />
            </el-descriptions-item>
            <el-descriptions-item label="用户组">
              <el-tag v-for="userRole of userInfo.user.role" :key="userRole">
                {{ userRole }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="简介" :span="3">
              {{ userInfo.user.intro | introFilter }}
            </el-descriptions-item>
            <el-descriptions-item label="参与的课程">
              <div v-for="c of userInfo.course" :key="c._id">
                《{{ c.name }}》- {{ c.chief }}
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="handleRemoveUser(userInfo.user._id)">
            删除用户
          </el-button>
          <el-button v-if="showSetAdmin" @click="handleSetAdmin(userInfo.user._id)">
            设为管理员
          </el-button>
          <slot name="removeAdmin" />
          <el-button style="float: right" @click="handleResetPWD(userInfo.user._id)">
            重置密码
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
    getUser,
    submitUser,
    userSearch,
    getInfo,
    resetPWD,
    removeUser,
    setAdmin
} from '@/api/admin'
import UploadExcelComponent from '@/components/UploadExcel/index.vue'
import ProfilePopover from '@/components/ProfilePopover/profile-popover.vue'
import Pagination from '@/components/Pagination'

export default {
    components: { UploadExcelComponent, ProfilePopover, Pagination },
    filters: {
        introFilter: val => {
            if (!val) {
                return '暂无简介'
            }
            return val
        }
    },
    props: {
        role: {
            type: String,
            default: 'student'
        },
        showSetAdmin: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            loading: true,
            users: [],
            searchQuery: '',
            avatarPath: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            usernameLabel: {
                teacher: '工号',
                student: '学号',
                admin: '用户名'
            },
            uploadUserList: [],
            roleLabel: {
                teacher: '教师',
                student: '学生',
                admin: '管理员'
            },
            infoText: `导入用户，将Excel文件拖到此处，或`,
            exporting: false,
            showUpPopoverKey: '',
            popoverOpenDelay: 200,
            submitting: false,
            dialogVisible: false,
            infoID: '',
            infoVisible: false,
            userInfo: {},
            listQuery: {
                page: 1,
                limit: 30
            },
            userNum: 0
        }
    },
    created() {
        this.getUser()
    },
    methods: {
        handleResetPWD(_id) {
            this.$confirm('确定为此用户重置密码？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: (action, instance, done) => {
                    if (action === 'confirm') {
                        instance.confirmButtonLoading = true

                        resetPWD({ _id })
                            .then(() => {
                                this.$message.success('重置成功')
                                instance.confirmButtonLoading = false
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
        },
        handleSetAdmin(_id) {
            this.$confirm('确定将此用户设为管理员？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: (action, instance, done) => {
                    if (action === 'confirm') {
                        instance.confirmButtonLoading = true
                        setAdmin({ _id })
                            .then(() => {
                                this.$message.success('设置成功')
                                instance.confirmButtonLoading = false
                                this.getUser()
                                this.infoVisible = false
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
        },
        handleRemoveUser(_id) {
            this.$confirm('确定删除此用户？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: (action, instance, done) => {
                    if (action === 'confirm') {
                        instance.confirmButtonLoading = true
                        removeUser({ _id })
                            .then(() => {
                                this.$message.success('删除成功')
                                instance.confirmButtonLoading = false
                                this.getUser()
                                this.infoVisible = false
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
        },
        clearInfo() {
            this.userInfo = {}
        },
        showInfo(_id) {
            this.infoVisible = true
            getInfo({ _id })
                .then(res => {
                    this.userInfo = res.data
                })
                .catch(err => {
                    console.log(err)
                })
        },
        remoteUserSearch(queryString, cb) {
            const { role } = this
            userSearch({ queryString, role })
                .then(res => {
                    cb(res.data)
                })
                .catch(err => {
                    console.log(err)
                })
        },
        handleSelect(item) {
            this.searchQuery = ''
            this.showInfo(item._id)
        },
        handleSubmit() {
            this.submitting = true
            const { uploadUserList, role } = this
            submitUser({
                userList: uploadUserList,
                role
            })
                .then(() => {
                    this.$message({
                        type: 'success',
                        message: '导入成功'
                    })
                    this.dialogVisible = false
                    this.getUser()
                    this.uploadUserList = []
                    this.submitting = false
                })
                .catch(() => {
                    this.submitting = false
                })
        },
        getUser() {
            this.loading = true
            const { listQuery, role } = this
            getUser({ ...listQuery, role })
                .then(res => {
                    this.users = res.data.users
                    this.userNum = res.data.userNum
                    this.loading = false
                })
                .catch(err => {
                    console.log(err)
                })
        },
        pagination() {
            this.loading = true
            const { listQuery, role } = this
            getUser({ ...listQuery, role }).then(res => {
                this.users = res.data.users
                this.loading = false
            })
        },

        handleExport() {
            this.exporting = true
            import('@/vendor/Export2Excel')
                .then(excel => {
                    const { role, usernameLabel, roleLabel } = this
                    const tHeader = [usernameLabel[role], '姓名']
                    const filterVal = ['username', 'name']
                    const list = this.users
                    const data = this.formatJson(filterVal, list)
                    excel.export_json_to_excel({
                        header: tHeader,
                        data,
                        filename: `${roleLabel[role]}数据`,
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
                    this.exporting = false
                })
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => v[j]))
        },
        cancel() {
            this.dialogVisible = false
        },
        handleSuccess({ results }) {
            const { role, usernameLabel, roleLabel } = this

            // console.log(results);
            // 判断文件是否符合规范
            if (!results[0] || !results[0][usernameLabel[role]] || !results[0]['姓名']) {
                this.$message({
                    type: 'warning',
                    message: '文件错误，请遵循模板格式填入信息！'
                })
                return
            }
            // 判断重复
            const userNum = []
            results.forEach(e => {
                // 数组中已有这个学号
                e[usernameLabel[role]] = (e[usernameLabel[role]] || '').toString().trim()
                e['姓名'] = (e['姓名'] || '').toString().trim()
                if (e[usernameLabel[role]] === '' || e['姓名'] === '') {
                    this.$message({
                        type: 'warning',
                        message: `文件中存在${usernameLabel[role]}号或姓名为空！`
                    })
                    this.uploadUserList = []
                    return
                }
                if (userNum.indexOf(e[usernameLabel[role]]) !== -1) {
                    this.$message({
                        type: 'warning',
                        message: `文件中${usernameLabel[role]}存在重复，请检查${roleLabel[role]}数据`
                    })
                    this.uploadUserList = []
                    return
                }
                userNum.push(e[usernameLabel[role]])
            })

            this.amount = results.length
            if (this.amount === userNum.length) {
                // console.log(userNum);
                this.uploadUserList = results.map(e => ({
                    username: e[usernameLabel[role]],
                    name: e['姓名']
                }))
            }
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
        }
    }
}
</script>

<style lang="scss" >
.el-tag + .el-tag {
    margin-left: 4px;
}
</style>
