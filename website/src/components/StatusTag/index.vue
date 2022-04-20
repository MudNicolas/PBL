<template>
    <div>
        <el-tag size="mini" style="margin-left: 4px" type="info" v-if="status === 'abandoned'">
            已废弃
        </el-tag>
        <el-tag size="mini" style="margin-left: 4px" type="danger" v-if="status === 'rejected'">
            审核驳回
        </el-tag>
        <el-tag
            size="mini"
            style="margin-left: 4px"
            type="danger"
            v-if="status === 'concludeRejected'"
        >
            结题审核驳回
        </el-tag>
        <el-tag
            size="mini"
            style="margin-left: 4px"
            type="warning"
            v-if="status === 'underApprove'"
        >
            审核中
        </el-tag>
        <el-tag
            size="mini"
            style="margin-left: 4px"
            type="warning"
            v-if="status === 'underConcludeApprove'"
        >
            结题审批中
        </el-tag>
        <el-tag size="mini" style="margin-left: 4px" type="success" v-if="status === 'conclude'">
            结题审核通过
        </el-tag>
        <el-tag size="mini" style="margin-left: 4px" type="success" v-if="status === 'approved'">
            审核通过
        </el-tag>
    </div>
</template>

<script>
export default {
    name: "StatusTag",
    props: ["status"],
}
</script>

<style>
</style>
