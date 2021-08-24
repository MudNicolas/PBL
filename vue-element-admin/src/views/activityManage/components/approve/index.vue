<template>
    <div class="wrapper" v-loading="loading">
        <el-empty description="本活动无需审批" v-if="!isNeedApprove"></el-empty>
        <el-table :data="projects" style="width: 100%">
            <el-table-column
                label="项目名称"
                align="center"
                :filters="[
                    { text: '有项目', value: true },
                    { text: '无项目', value: false },
                ]"
                :filter-method="filterHandleProjectExist"
            >
                <template slot-scope="scope">
                    {{ scope.row.projectName | projectNameFilter }}
                </template>
            </el-table-column>
            <el-table-column label="作者" align="center">
                <template slot-scope="scope">
                    <el-popover
                        v-for="author of scope.row.authors"
                        :key="author._id"
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
            <el-table-column
                label="当前状态"
                align="center"
                :filters="[
                    { text: '审批通过', value: 'approved' },
                    { text: '审批中', value: 'underApprove' },
                ]"
                :filter-method="filterHandleProjectStatus"
            >
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

            <el-table-column
                prop="submitForApproveNumber"
                label="提交审批次数"
                sortable
                align="center"
            ></el-table-column>
            <el-table-column label="最新提审时间" sortable align="center">
                <template slot-scope="scope">
                    {{ scope.row.latestSubmitAuditTime | normalFormatTime }}
                </template>
            </el-table-column>
            <el-table-column>
                <template slot-scope="scope">
                    <el-button
                        :disabled="!scope.row.stageID"
                        @click="handleToPage(scope.row.stageID)"
                    >
                        <span v-if="scope.row.status === 'underApprove'">审批</span>
                        <span v-else>查看</span>
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import { getPendingApproveProjectStage } from "@/api/activityManage"
import ProfilePopover from "@/components/ProfilePopover/profile-popover.vue"
import { tagTypeFilter, statusFilter } from "@/utils/timelineFilters"
import { normalFormatTime } from "@/utils/index.js"

export default {
    name: "approve",
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
            activityID: this.activityId,
            loading: false,
            isNeedApprove: false,
            projects: [],
            showUpPopoverKey: "",
        }
    },
    created() {
        this.getPendingApproveProjectStage()
    },
    methods: {
        getPendingApproveProjectStage() {
            this.loading = true
            let { activityID } = this
            getPendingApproveProjectStage({ activityID })
                .then(res => {
                    let { isNeedApprove } = res.data
                    this.isNeedApprove = isNeedApprove
                    if (isNeedApprove) {
                        let { projects } = res.data
                        this.projects = projects
                    }
                    this.loading = false
                })
                .catch(err => {
                    console.log(err)
                })
        },
        filterHandleProjectExist(value, row, column) {
            return value === !!row.projectName
        },
        filterHandleProjectStatus(value, row, column) {
            return value === row.status
        },
        handleToPage(id) {
            this.$router.push(`/course/section/activity/timelineProject/stage/approve/${id}`)
        },
    },
}
</script>

<style lang='scss' scoped>
.wrapper {
    padding-top: 30px;
}
</style>
