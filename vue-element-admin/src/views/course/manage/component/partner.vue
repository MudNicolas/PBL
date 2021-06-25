<template>
    <div class="container" v-loading="loading"></div>
</template>

<script>
import { getAllTeacher } from "@/api/course";
export default {
    name: "Partner",
    props: ["courseId"],
    data() {
        return {
            loading: true,
        };
    },
    created() {
        this.getAllTeacher();
    },
    methods: {
        getAllTeacher() {
            getAllTeacher({ courseID: this.courseId })
                .then((res) => {})
                .catch(() => {});
        },
    },
};
</script>

<style scoped>
.container {
    padding-top: 15px;
    min-height: 120px;
}
</style>
