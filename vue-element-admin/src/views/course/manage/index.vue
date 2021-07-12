<template>
    <div class="container">
        <el-tabs type="border-card" v-model="activeName">
            <el-tab-pane
                v-for="component of components"
                :key="'CourseManageTab' + component.name"
                :label="component.label"
                lazy
                :name="component.name"
            >
                <component
                    v-if="activeName === component.name"
                    :is="component.name"
                    :course-id="courseID"
                />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import info from "./component/info.vue";
import student from "./component/student.vue";
import partner from "./component/partner.vue";
import commentTemplate from "./component/comment-template.vue";
import group from "./component/group.vue";

export default {
    components: { info, student, partner, commentTemplate, group },
    name: "ManageCourse",

    data() {
        return {
            courseID: this.$route.params.id,
            activeName: "info",
            components: [
                { name: "info", label: "基础设置" },
                { name: "student", label: "学生管理" },
                { name: "group", label: "分组管理" },
                { name: "partner", label: "协作教师管理" },
                { name: "commentTemplate", label: "评论模板管理" },
            ],
        };
    },
    watch: {
        activeName(val) {
            this.$router.push(`${this.$route.path}?tab=${val}`);
        },
        "$route.query.tab"(val) {
            if (
                val &&
                this.components.some((e) => {
                    return e.name === val;
                })
            ) {
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
