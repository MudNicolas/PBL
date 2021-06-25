<template>
    <div class="container">
        <el-tabs type="border-card" v-model="activeName">
            <el-tab-pane label="基础设置" lazy :name="components[0]">
                <info :course-id="courseID" />
            </el-tab-pane>

            <el-tab-pane label="学生管理" lazy :name="components[1]">
                <student :course-id="courseID"
            /></el-tab-pane>

            <el-tab-pane label="分组管理">分组管理</el-tab-pane>

            <el-tab-pane label="合作教师管理" lazy :name="components[3]">
                <partner :course-id="courseID" />
            </el-tab-pane>

            <el-tab-pane label="评论模板管理">评论模板管理</el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import info from "./component/info.vue";
import student from "./component/student.vue";
import partner from "./component/partner.vue";

export default {
    components: { info, student, partner },
    name: "ManageCourse",

    data() {
        return {
            courseID: this.$route.params.id,
            activeName: "info",
            components: ["info", "student", "", "partner"],
        };
    },
    watch: {
        activeName(val) {
            this.$router.push(`${this.$route.path}?tab=${val}`);
        },
        "$route.query.tab"(val) {
            // console.log(val);
            if (val && this.components.indexOf(val) !== -1) {
                this.activeName = val;
            }
        },
    },
    created() {
        // init the default selected tab
        const tab = this.$route.query.tab;
        if (tab) {
            this.activeName = tab;
        }
    },
};
</script>

<style lang="scss" scoped>
.container {
    padding: 30px;
}
</style>
