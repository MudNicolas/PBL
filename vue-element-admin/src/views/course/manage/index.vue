<template>
    <div class="container">
        <el-tabs type="border-card">
            <el-tab-pane label="基础设置" lazy>
                <info :course-id="courseID" />
            </el-tab-pane>
            <el-tab-pane label="学生管理" lazy
                ><student :course-id="courseID"
            /></el-tab-pane>
            <el-tab-pane label="分组管理">分组管理</el-tab-pane>
            <el-tab-pane label="合作教师管理">合作教师管理</el-tab-pane>
            <el-tab-pane label="评论模板管理">评论模板管理</el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import info from "./component/info.vue";
import student from "./component/student.vue";

export default {
    components: { info, student },
    name: "ManageCourse",
    conponents: { info },
    created() {},
    data() {
        return {
            courseID: this.$route.params.id,
        };
    },
};
</script>

<style lang="scss" scoped>
.container {
    padding: 30px;
}
</style>
