<template>
    <div class="view-container" v-loading="loading" element-loading-text="加载中">
        <div v-if="course.name">
            <el-row :gutter="20" v-if="checkPermission(['teacher'])">
                <el-col :span="23" :xs="24">
                    <div class="tools-wrapper">
                        <router-link :to="'/course/manage/' + courseID">
                            <el-button plain>
                                <i class="el-icon-s-tools" />
                                课程管理
                            </el-button>
                        </router-link>
                        <div class="right-wrapper">
                            <el-switch v-model="editable" active-text="启用编辑"></el-switch>
                            <router-link :to="'/course/section/create/' + courseID">
                                <el-button
                                    type="primary"
                                    icon="el-icon-plus"
                                    style="margin-left: 16px"
                                >
                                    新建节
                                </el-button>
                            </router-link>
                        </div>
                    </div>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="5" :xs="24">
                    <info-card :course="course" />
                </el-col>
                <el-col :span="18" :xs="24">
                    <section-list
                        v-if="sections.length > 0"
                        :sections="sections"
                        :editable="editable"
                        :course-id="courseID"
                    />
                    <no-section-card v-else />
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import { getCourseView } from "@/api/course-view"
import SectionList from "./components/SectionList.vue"
import InfoCard from "./components/info-card"
import NoSectionCard from "./components/NoSectionCard.vue"
import checkPermission from "@/utils/permission"

export default {
    name: "CourseView",
    components: { InfoCard, SectionList, NoSectionCard },
    data() {
        return {
            courseID: "",
            course: {},
            sections: [],
            loading: true,
            editable: false,
        }
    },
    created() {
        //let selfParam = this.$route.path.split("/");
        this.courseID = this.$route.params.id
        this.getCourseView()
    },
    methods: {
        getCourseView() {
            getCourseView({ courseID: this.courseID }).then(res => {
                this.course = res.data.course
                this.sections = res.data.sections
                this.loading = false
            })
        },
        checkPermission,
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

    .right-wrapper {
        margin-left: auto;
    }
}
</style>
