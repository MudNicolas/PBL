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
        <template slot="header">
          <el-input v-model="searchQuery" placeholder="搜索" @input="handleSearchInput">
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>
        </template>

        <template slot-scope="scope">
          <el-button type="primary" @click="showInfo(scope.row._id)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
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

import { getCourse } from '@/api/admin'

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
            courseNum: 0
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
</style>

<style lang="scss">
.el-autocomplete-suggestion {
    display: none;
}
</style>

