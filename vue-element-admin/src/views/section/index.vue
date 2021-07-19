<template>
    <div class="container">
        <el-tabs v-model="activeName" @tab-click="handleClick" type="border-card">
            <el-tab-pane label="用户管理" name="first">用户管理</el-tab-pane>
            <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
            <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
            <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
export default {
    name: "SectionView",
    created() {
        this.sectionID = this.$route.params.id
    },
    data() {
        return {
            sectionID: "",
        }
    },
}
</script>

<style lang='scss' scoped>
.container {
    padding: 20px;
}
</style>
