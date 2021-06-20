<template>
    <div
        class="view-container"
        v-loading="loading"
        element-loading-text="加载中"
    >
        <div v-if="course.name">
            <el-row :gutter="20">
                <el-col :span="23" :xs="24">
                    <div class="tools-wrapper">
                        <router-link :to="'/course/manage/' + courseID">
                            <el-button plain
                                ><i
                                    class="el-icon-s-tools"
                                />课程设置</el-button
                            >
                        </router-link>
                        <div class="switch-wrapper">
                            <el-switch
                                v-model="dragable"
                                active-text="开启拖动"
                            >
                            </el-switch>
                        </div>
                    </div>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="5" :xs="24">
                    <info-card :course="course" />
                </el-col>
                <el-col :span="18" :xs="24">
                    <drag-list :dragable="dragable" />
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import { getCourseInfo, getSection } from "@/api/course-view";
import DragList from "./components/dragList";
import InfoCard from "./components/info-card";

export default {
    name: "CourseView",
    components: { InfoCard, DragList },
    data() {
        return {
            courseID: "",
            course: {},
            loading: true,
            dragable: false,
        };
    },
    created() {
        //let selfParam = this.$route.path.split("/");
        this.courseID = this.$route.params.id;
        this.getCourseInfo();
    },
    methods: {
        getCourseInfo() {
            getCourseInfo({ courseID: this.courseID }).then((res) => {
                this.course = res.data.course;
                this.loading = false;
            });
        },
        getSection() {
            getSection({ courseID: this.courseID }).then((res) => {});
        },
    },
};
</script>

<style scoped>
.view-container {
    min-height: 80vh;
    padding: 20px;
}
.switch-wrapper {
    margin-left: auto;
}

.tools-wrapper {
    display: flex;
    align-items: center;
    margin-bottom: 18px;
    flex-direction: row;
    justify-content: flex-start;
}
</style>
