<template>
    <!--TODO: 小组的按组显示，个人的按人显示。进入public stage页面-->
    <div class="container" v-loading="loading">
        <el-table :data="projects" style="width: 100%">
            <el-table-column label="项目名称">
                <template slot-scope="scope">
                    {{ scope.row.projectName | projectNameFilter }}
                </template>
            </el-table-column>
            <el-table-column label="作者">
                <template slot-scope="scope">
                    <el-popover
                        v-for="author of scope.row.authors"
                        placement="left"
                        trigger="hover"
                        :open-delay="200"
                        width="360"
                        @show="showUpPopoverKey = author._id"
                    >
                        <div>
                            <profile-popover
                                :uid="author._id"
                                :show-up-popover-key="showUpPopoverKey"
                            />
                        </div>
                        <span slot="reference">
                            <span style="margin-right: 8px">{{ author.name }}</span>
                        </span>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="当前状态">
                <template slot-scope="scope">
                    <el-tag
                        size="mini"
                        style="margin-left: 4px"
                        :type="scope.row.status | tagTypeFilter"
                        v-if="scope.row.status"
                    >
                        {{ scope.row.status | statusFilter }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="stageNumber" label="已公开的阶段数" sortable></el-table-column>
            <el-table-column label="最新公开时间" sortable>
                <template slot-scope="scope">
                    {{ scope.row.latestPublicTime | normalFormatTime }}
                </template>
            </el-table-column>
            <el-table-column>
                <template slot-scope="scope">
                    <el-button>查看</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import { getPubProjects } from "@/api/timeline-project"
import { tagTypeFilter, statusFilter } from "@/utils/timelineFilters"
import { normalFormatTime } from "@/utils/index.js"
import ProfilePopover from "@/components/ProfilePopover/profile-popover.vue"

export default {
    props: ["activityId"],
    components: { ProfilePopover },
    filters: {
        statusFilter,
        tagTypeFilter,
        normalFormatTime: val => {
            if (val) {
                return normalFormatTime(new Date(val))
            }
        },
        projectNameFilter: val => {
            if (!val) {
                return "暂无项目"
            }
            return val
        },
    },
    data() {
        return {
            loading: true,
            projects: [],
            showUpPopoverKey: "",
        }
    },
    created() {
        this.getPubProjects()
    },
    methods: {
        getPubProjects() {
            this.loading = true
            let activityID = this.activityId
            getPubProjects({ activityID })
                .then(res => {
                    this.projects = res.data
                    this.loading = false
                })
                .catch(() => {})
        },
    },
}
</script>

<style lang='scss' scoped>
.container {
    min-height: 40vh;
    padding-top: 20px;
}
</style>
