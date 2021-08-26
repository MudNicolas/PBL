<template>
    <div class="wrapper" v-loading="loading">
        <el-table :data="projects" style="width: 100%">
            <el-table-column width="30">
                <template slot-scope="scope">
                    <el-tooltip content="查看项目私有空间详情" placement="right" effect="light">
                        <el-button
                            v-if="scope.row.projectID"
                            icon="el-icon-view"
                            type="text"
                            @click="
                                $router.push(
                                    `/course/section/activity/timeline/overview/private/view/${scope.row.projectID}`
                                )
                            "
                        ></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
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
                label="项目状态"
                align="center"
                :filters="[
                    { text: '待提审', value: 'beforeApprove' },
                    { text: '审批中', value: 'underApprove' },
                    { text: '行进中', value: 'normal' },
                    { text: '申请结题中', value: 'underConcludeApprove' },
                    { text: '已结题', value: 'conclude' },
                ]"
                :filter-method="filterHandleProjectStatus"
            >
                <template slot-scope="scope">
                    <el-tag
                        size="mini"
                        style="margin-left: 4px"
                        :type="scope.row.projectStatus | tagTypeFilter"
                        v-if="scope.row.projectStatus"
                    >
                        {{ scope.row.projectStatus | statusFilter }}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column
                label="审批状态"
                align="center"
                :filters="[
                    { text: '待提审', value: 'beforeApprove' },
                    { text: '审批中', value: 'underApprove' },
                    { text: '审核驳回', value: 'rejected' },
                    { text: '审核通过', value: 'approved' },
                    { text: '行进中', value: 'normal' },
                    { text: '申请结题中', value: 'underConcludeApprove' },
                    { text: '结题申请驳回', value: 'concludeRejected' },
                    { text: '已结题', value: 'conclude' },
                ]"
                :filter-method="filterHandleProjectStatus"
            >
                <template slot-scope="scope">
                    <status-tag :status="scope.row.stageStatus" />
                </template>
            </el-table-column>

            <el-table-column label="申请时间" sortable align="center">
                <template slot-scope="scope">
                    {{ scope.row.submitTime | normalFormatTime }}
                </template>
            </el-table-column>
            <el-table-column>
                <template slot-scope="scope">
                    <el-button
                        v-if="scope.row.stageID"
                        @click="
                            $router.push(
                                `/course/section/activity/timelineProject/stage/approve/${scope.row.stageID}`
                            )
                        "
                        type="primary"
                    >
                        <span
                            v-if="
                                ['underApprove', 'underConcludeApprove'].includes(scope.row.status)
                            "
                        >
                            审批
                        </span>
                        <span v-else>查看结果</span>
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
import StatusTag from "@/components/StatusTag"

export default {
    name: "approve",
    props: ["activityId"],
    components: { ProfilePopover, StatusTag },
    filters: {
        statusFilter,
        tagTypeFilter,
        normalFormatTime: val => {
            if (val) {
                return normalFormatTime(new Date(val), "{y}-{m}-{d} {h}:{i}")
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
                    let { projects } = res.data
                    this.projects = projects
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
    },
}
</script>

<style lang='scss' scoped>
.wrapper {
    padding-top: 30px;
}
</style>
