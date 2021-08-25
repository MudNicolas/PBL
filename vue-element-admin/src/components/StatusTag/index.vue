<template>
    <div>
        <el-tag
            size="mini"
            style="margin-left: 4px"
            type="info"
            v-if="stage.status === 'abandoned'"
        >
            已废弃
        </el-tag>
        <el-tag
            size="mini"
            style="margin-left: 4px"
            type="danger"
            v-if="stage.status === 'rejected'"
        >
            审核驳回
        </el-tag>
        <el-tag
            size="mini"
            style="margin-left: 4px"
            type="danger"
            v-if="stage.status === 'concludeRejected'"
        >
            结题审核驳回
        </el-tag>
        <el-tag
            size="mini"
            style="margin-left: 4px"
            type="warning"
            v-if="stage.status === 'underApprove'"
        >
            审核中
        </el-tag>
        <el-tag
            size="mini"
            style="margin-left: 4px"
            type="warning"
            v-if="stage.status === 'underConcludeApprove'"
        >
            结题审批中
        </el-tag>
        <el-tag
            size="mini"
            style="margin-left: 4px"
            type="success"
            v-if="stage.status === 'conclude'"
        >
            结题审核通过
        </el-tag>
        <el-tag
            size="mini"
            style="margin-left: 4px"
            type="success"
            v-if="stage.status === 'approved'"
        >
            审核通过
        </el-tag>
        <el-tag size="mini" style="margin-left: 4px" v-if="stage.isPublic">已公开</el-tag>
    </div>
</template>

<script>
export default {
    name: "StatusTag",
    props: ["stage"],
}
</script>

<style>
</style>
