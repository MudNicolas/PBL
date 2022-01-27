<template>
  <div class="container">
    <el-table v-loading="loading" :data="courses" border highlight-current-row>
      <el-table-column prop="name" label="课程名称" />
      <el-table-column label="所属教师">
        <template slot-scope="scope">
          <el-popover
            placement="left"
            trigger="hover"
            :open-delay="popoverOpenDelay"
            width="360"
            @show="showUpPopoverKey = scope.row.chief._id"
          >
            <div>
              <profile-popover
                :uid="scope.row.chief._id"
                :show-up-popover-key="showUpPopoverKey"
              />
            </div>
            <span slot="reference">
              {{ scope.row.chief.name }}
            </span>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.date | normalFormatTime }}
        </template>
      </el-table-column>
      <el-table-column prop="studentNum" label="学生数量" />
      <el-table-column label="状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isUsed | isUsedTagFilter">
            {{ scope.row.isUsed | isUsedFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center">
        <template slot="header" slot-scope="{}">
          <el-input v-model="searchQuery" placeholder="搜索" @input="handleSearchInput">
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>
        </template>

        <template slot-scope="scope">
          <el-button type="primary" @click="showInfo(scope.row._id)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="课程详情" :visible.sync="infoDialogVisible" @closed="clearCourseInfo">
      <el-form v-if="courseInfo.info && courseInfo.info._id">
        <el-form-item>
          <el-descriptions direction="vertical" border>
            <el-descriptions-item label="名称">
              {{ courseInfo.info.name }}
            </el-descriptions-item>
            <el-descriptions-item label="创建日期">
              {{ courseInfo.info.date | normalFormatTime }}
            </el-descriptions-item>
            <el-descriptions-item label="学生数量">
              {{ courseInfo.info.studentNum }}
            </el-descriptions-item>
            <el-descriptions-item label="主教师">
              <el-popover
                placement="left"
                trigger="hover"
                :open-delay="popoverOpenDelay"
                width="360"
                @show="showUpPopoverKey = courseInfo.info.chiefTeacher._id"
              >
                <div>
                  <profile-popover
                    :uid="courseInfo.info.chiefTeacher._id"
                    :show-up-popover-key="showUpPopoverKey"
                  />
                </div>
                <span slot="reference">
                  {{ courseInfo.info.chiefTeacher.name }}
                </span>
              </el-popover>
            </el-descriptions-item>
            <el-descriptions-item label="协作教师">
              <el-popover
                v-for="t of courseInfo.info.partnerTeacher"
                :key="t._id"
                placement="left"
                trigger="hover"
                :open-delay="popoverOpenDelay"
                width="360"
                @show="showUpPopoverKey = t._id"
              >
                <div>
                  <profile-popover
                    :uid="t._id"
                    :show-up-popover-key="showUpPopoverKey"
                  />
                </div>
                <span slot="reference">{{ t.name }}&nbsp;</span>
              </el-popover>
            </el-descriptions-item>

            <el-descriptions-item label="状态">
              {{ courseInfo.info.isUsed | isUsedFilter }}
            </el-descriptions-item>
            <el-descriptions-item label="简介" :span="3">
              {{ courseInfo.info.introduction }}
            </el-descriptions-item>
            <el-descriptions-item label="课程封面" :span="2">
              <div class="block">
                <el-image :src="path + courseInfo.info.cover" fit="fill">
                  <div slot="placeholder" class="image-slot">
                    加载中
                    <span class="dot">...</span>
                  </div>
                </el-image>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-form-item>
        <el-form-item>
          <el-table :data="courseInfo.section">
            <el-table-column label="节恢复">
              <el-table-column prop="name" label="名称" />
              <el-table-column label="创建日期">
                <template slot-scope="scope">
                  {{ scope.row.date | normalFormatTime }}
                </template>
              </el-table-column>
              <el-table-column label="状态">
                <template slot-scope="scope">
                  {{ scope.row.isUsed | isUsedFilter }}
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                  <el-button @click="handleRecover('Section', scope.row._id)">
                    恢复
                  </el-button>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item>
          <el-table :data="courseInfo.activity">
            <el-table-column label="活动恢复">
              <el-table-column prop="name" label="名称" />
              <el-table-column label="类别">
                <template slot-scope="scope">
                  {{ scope.row.type | typeFilter }}
                </template>
              </el-table-column>
              <el-table-column prop="section" label="所属节" />
              <el-table-column label="状态">
                <template slot-scope="scope">
                  {{ scope.row.isUsed | isUsedFilter }}
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                  <el-button @click="handleRecover('Activity', scope.row._id)">
                    恢复
                  </el-button>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item>
          <el-table :data="courseInfo.info.partnerTeacher">
            <el-table-column label="协作教师管理">
              <el-table-column prop="username" label="工号" />

              <el-table-column prop="name" label="姓名" />

              <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                  <el-button
                    type="danger"
                    @click="
                      handleRemovePartner(courseInfo.info._id, scope.row._id)
                    "
                  >
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item>
          <el-button
            v-if="courseInfo.info.isUsed"
            type="danger"
            @click="handleRemoveCourse(courseInfo.info._id)"
          >
            删除课程
          </el-button>
          <el-button
            v-else
            type="primary"
            @click="handleRecover('Course', courseInfo.info._id)"
          >
            恢复课程
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <pagination
      style="padding-top: 10px; margin-top: 10px"
      :total="courseNum"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      :page-sizes="[12, 20, 30, 50, 80]"
      @pagination="pagination"
    />
  </div>
</template>

<script>
import ProfilePopover from '@/components/ProfilePopover/profile-popover.vue'
import Pagination from '@/components/Pagination'
import { normalFormatTime } from '@/utils/index.js'
import debounce from 'throttle-debounce/debounce'

import { getCourse, getCourseInfo, removeCourse, handleRecover, removePartner } from '@/api/admin'

export default {
    name: 'CourseManager',
    components: { ProfilePopover, Pagination },
    filters: {
        isUsedTagFilter: val => {
            if (!val) {
                return 'danger'
            }
        },
        isUsedFilter: val => {
            const map = {
                true: '活跃中',
                false: '已废弃'
            }
            return map[val]
        },
        normalFormatTime: val => {
            return normalFormatTime(new Date(val), '{y}-{m}-{d} {h}:{i}')
        },
        typeFilter: val => {
            const map = {
                TimeLineProject: '时间线活动',
                Evaluation: '互评活动'
            }
            return map[val]
        }
    },
    data() {
        return {
            loading: false,
            searchQuery: '',
            courses: [],
            showUpPopoverKey: '',
            popoverOpenDelay: 200,
            avatarPath: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            listQuery: {
                page: 1,
                limit: 12
            },
            courseNum: 0,
            infoDialogVisible: false,
            courseInfo: {},
            path: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_COVER_PATH
        }
    },
    created() {
        this.getCourse()
    },
    mounted() {
        const delay = 300
        this.debouncedGetData = debounce(delay, this.getCourse)
    },
    methods: {
        clearCourseInfo() {
            this.courseInfo = {}
        },
        handleRemovePartner(courseID, uid) {
            this.$confirm('确定从本课程中移除此协作教师？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: (action, instance, done) => {
                    if (action === 'confirm') {
                        instance.confirmButtonLoading = true
                        removePartner({ courseID, uid })
                            .then(() => {
                                this.$message.success('移除成功')
                                instance.confirmButtonLoading = false
                                this.showInfo(courseID)
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
        handleRemoveCourse(_id) {
            this.$confirm('确定删除此课程？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: (action, instance, done) => {
                    if (action === 'confirm') {
                        instance.confirmButtonLoading = true
                        removeCourse({ _id })
                            .then(() => {
                                this.$message.success('删除成功')
                                instance.confirmButtonLoading = false
                                this.infoDialogVisible = false
                                this.getCourse()
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
        handleRecover(model, _id) {
            const map = {
                Course: '课程',
                Section: '节',
                Activity: '活动'
            }
            this.$confirm(`确定恢复此${map[model]}？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: (action, instance, done) => {
                    if (action === 'confirm') {
                        instance.confirmButtonLoading = true
                        handleRecover({ model, _id })
                            .then(() => {
                                this.$message.success('恢复成功')
                                instance.confirmButtonLoading = false
                                this.showInfo(this.courseInfo.info._id)
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
        showInfo(courseID) {
            this.infoDialogVisible = true
            getCourseInfo({ courseID })
                .then(res => {
                    this.courseInfo = res.data
                })
                .catch(err => {
                    console.log(err)
                })
        },
        handleSearchInput(value) {
            this.debouncedGetData(value)
        },

        getCourse(searchQuery) {
            this.loading = true
            const { listQuery } = this
            getCourse({ ...listQuery, searchQuery })
                .then(res => {
                    this.courses = res.data.courses
                    this.courseNum = res.data.courseNum
                    this.loading = false
                })
                .catch(err => {
                    console.log(err)
                })
        },
        pagination() {
            this.getCourse()
        }
    }
}
</script>

<style lang="scss" scoped>
.container {
    padding: 40px;
    min-height: 80vh;
}
.block {
    display: flex;
    background: #f5f7fa;
    justify-content: center;
    align-items: center;
    color: #c0c4cc;
    font-size: 14px;
}
.block::after {
    content: "";
    padding-top: 60%;
}
</style>

<style lang="scss">
.el-autocomplete-suggestion {
    display: none;
}
</style>

