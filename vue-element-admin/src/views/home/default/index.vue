<template>
    <div
        class="homepage-teacher-container"
        :class="{ 'empty-container': courseNum == 0 }"
        v-loading="loading"
        element-loading-text="加载中"
    >
        <div v-if="courseNum == 0">
            <img src="@/assets/empty_images/empty.gif" class="emptyGif" />
            <div v-if="checkPermission(['teacher'])" style="text-align: center">
                当前没有课程，点击
                <el-button type="primary" @click="createCourse"
                    >新建课程</el-button
                >
            </div>
            <div v-else style="text-align: center">
                当前没有课程，请联系老师将你添加入一个课程
            </div>
        </div>
        <div v-else>
            <el-row
                v-for="index in Math.ceil(courseNum / 4)"
                :key="'home-course-row-' + index"
                style="margin-bottom: 16px"
            >
                <el-col
                    :span="5"
                    v-for="(item, i) in courseList.slice(
                        (index - 1) * 4,
                        index * 4
                    )"
                    :key="'homeCourse' + item._id"
                    :offset="i % 4 == 0 ? 0 : 1"
                    style="margin-bottom: 32px; position: relative"
                >
                    <card-relative :course="item" />
                    <card-absolute
                        :course="item"
                        :clickedItemID.sync="clickedItemID"
                    />
                </el-col>
            </el-row>

            <pagination
                style="padding-top: 10px; margin-top: 10px"
                :hidden="courseNum <= 12"
                :total="courseNum"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="pagination"
            />
        </div>
    </div>
</template>

<script>
import { getCourseList } from "@/api/course";
import Pagination from "@/components/Pagination";
import cardRelative from "./component/card-relative";
import cardAbsolute from "./component/card-absolute";
import checkPermission from "@/utils/permission"; // 权限判断函数

export default {
    name: "DefaultHome",
    components: {
        Pagination,
        cardRelative,
        cardAbsolute,
    },
    data() {
        return {
            emptyGif:
                "https://wpimg.wallstcn.com/0e03b7da-db9e-4819-ba10-9016ddfdaed3",
            courseList: [],
            courseNum: -1,
            liftCard: -1,
            loading: true,
            clickedItemID: "",
            listQuery: {
                page: 1,
                limit: 12,
            },
        };
    },
    created() {
        this.fetchCourseList();
    },

    methods: {
        createCourse() {
            this.$router.push(`/course/create`);
        },
        fetchCourseList() {
            getCourseList(this.listQuery).then((res) => {
                let { courseList, courseNum } = res.data;
                this.courseList = courseList;
                this.courseNum = courseNum;
                this.loading = false;
            });
        },
        pagination() {
            this.loading = true;
            getCourseList(this.listQuery).then((res) => {
                let { courseList } = res.data;
                this.courseList = courseList;
                this.loading = false;
            });
        },
        checkPermission,
    },
};
</script>

<style lang="scss" scoped>
.emptyGif {
    display: block;
    width: 45%;
    margin: 0 auto;
}

.homepage-teacher-container {
    padding: 50px;
    min-height: 80vh;
}

.empty-container {
    min-height: 100vh;
    background-color: #e3e3e3;
}
</style>
