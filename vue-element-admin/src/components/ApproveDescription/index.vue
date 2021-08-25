<template>
    <el-descriptions title="项目审批" direction="vertical" border>
        <el-descriptions-item label="审批者">
            {{ approvement.approver.name }}
        </el-descriptions-item>
        <el-descriptions-item label="审批结果">
            {{ approvement.status | statusFilter }}
        </el-descriptions-item>

        <el-descriptions-item label="审批时间">
            {{ normalFormatTime(new Date(approvement.time), "{y}-{m}-{d} {h}:{i}") }}
        </el-descriptions-item>
        <el-descriptions-item label="理由">
            {{ approvement.reason }}
        </el-descriptions-item>
    </el-descriptions>
</template>

<script>
import { normalFormatTime } from "@/utils/index.js"
import { statusFilter } from "@/utils/timelineFilters"

export default {
    props: ["approvement"],
    filters: {
        statusFilter,
    },
    methods: {
        normalFormatTime,
    },
}
</script>

<style>
</style>
