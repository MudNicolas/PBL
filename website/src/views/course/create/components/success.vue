<template>
    <div class="suc-wrapper">
        <div class="wrapper-col">
            <i class="el-icon-success suc-icon suc-wrapper"></i>
            <div class="suc-wrapper">
                <div class="suc-word">创建课程成功</div>
            </div>
            <div class="suc-wrapper">
                <router-link :to="'/course/view/' + courseId">
                    <el-button type="primary">进入课程</el-button>
                </router-link>
                <router-link to="/">
                    <el-button style="margin-left: 10px">回到首页</el-button>
                </router-link>
                <el-button @click="toCreate" style="margin-left: 10px">继续创建</el-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "createCourseSuccess",
    props: ["courseId"],
    methods: {
        toCreate() {
            let fullPath = "/course/create"

            this.$router.replace({
                path: "/redirect" + fullPath,
            })
        },
    },
}
</script>

<style scoped>
.suc-wrapper {
    display: flex;
    justify-content: center;
    padding-top: 28px;
}
.wrapper-col {
    flex-direction: column;
}
.suc-icon {
    font-size: 14rem;
    color: rgb(17, 169, 131);
}
.suc-word {
    font-size: 1.4rem;
}
</style>
