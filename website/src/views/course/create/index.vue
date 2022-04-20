<template>
    <div class="create-course-container">
        <el-row style="margin-bottom: 24px; margin-left: 96px">
            <el-col :span="16" :offset="4">
                <el-steps :active="active" finish-status="success">
                    <el-step title="课程基本信息"></el-step>
                    <el-step title="导入学生"></el-step>
                    <el-step title="协作教师"></el-step>
                    <el-step title="创建成功"></el-step>
                </el-steps>
            </el-col>
        </el-row>

        <el-form ref="course" :model="course" label-width="80px">
            <transition name="fade-transform" mode="out-in">
                <component
                    :is="comp[active]"
                    @prev="prev"
                    @next="next"
                    @onSubmit="onSubmit"
                    :course="course"
                    :course-id="courseID"
                    :ref="comp[active]"
                    :options.sync="options"
                    :cover-url.sync="coverUrl"
                ></component>
            </transition>
        </el-form>
    </div>
</template>

<script>
import courseIntro from "./components/intro";
import uploadStudent from "./components/uploadStudent";
import partner from "./components/partner";
import createCourseSuccess from "./components/success";
import { uploadCreateCourse } from "@/api/course";

export default {
    name: "CreateCourse",
    components: { courseIntro, uploadStudent, partner, createCourseSuccess },

    data() {
        return {
            course: {
                name: "",
                introduction: "",
                cover: "default.jpg",
                studentList: [],
                partnerID: [],
            },
            comp: [
                "courseIntro",
                "uploadStudent",
                "partner",
                "uploading",
                "createCourseSuccess",
            ],
            options: [],
            coverUrl: "",
            courseID: "",

            active: 0,
        };
    },

    methods: {
        onSubmit() {
            this.course.name = this.course.name.trim();
            this.course.introduction = this.course.introduction.trim();
            uploadCreateCourse({ course: this.course })
                .then((res) => {
                    this.courseID = res.data.courseID;
                    this.getNewCourseRoute();
                })
                .catch(() => {
                    this.$refs.partner.onErr();
                });
        },

        next() {
            if (this.active++ > 3) this.active = 0;
        },
        prev() {
            if (this.active-- < 0) this.active = 0;
        },
        getNewCourseRoute() {
            this.$store
                .dispatch("permission/generateRoutes", ["teacher"])
                .then(() => {
                    this.active = 4;
                })
                .catch((err) => {
                    this.$message({
                        type: "danger",
                        message: err,
                    });
                });
        },
    },
};
</script>

<style >
.create-course-container {
    padding: 50px 60px 0px;
}
.info {
    font-size: 13px;
    color: #666;
}
</style>
