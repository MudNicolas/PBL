<template>
    <div class="view-container" v-loading="loading" element-loading-text="加载中">
        <div v-if="course.name">
            <el-row :gutter="20">
                <el-col :span="23" :xs="24">
                    <div class="tools-wrapper">
                        <router-link :to="'/course/manage/' + courseID">
                            <el-button plain><i class="el-icon-s-tools" />课程设置</el-button>
                        </router-link>
                        <div class="switch-wrapper">
                            <el-switch v-model="dragable" active-text="开启拖动"> </el-switch>
                        </div>
                    </div>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="5" :xs="24">
                    <info-card :course="course" />
                </el-col>
                <el-col :span="18" :xs="24">
                    <section-list :dragable="dragable" />
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import { getCourseInfo } from "@/api/course-view"
import SectionList from "./components/SectionList.vue"
import InfoCard from "./components/info-card"

export default {
    name: "CourseView",
    components: { InfoCard, SectionList },
    data() {
        return {
            courseID: "",
            course: {},
            loading: true,
            dragable: false,
        }
    },
    created() {
        //let selfParam = this.$route.path.split("/");
        this.courseID = this.$route.params.id
        this.getCourseInfo()
    },
    methods: {
        getCourseInfo() {
            getCourseInfo({ courseID: this.courseID }).then(res => {
                this.course = res.data.course
                this.loading = false
            })
        },
    },
}
</script>

<style lang='scss' scoped>
.view-container {
    min-height: 80vh;
    padding: 20px;
}

.tools-wrapper {
    display: flex;
    align-items: center;
    margin-bottom: 18px;
    flex-direction: row;
    justify-content: flex-start;

    .switch-wrapper {
        margin-left: auto;
    }
}
</style>
