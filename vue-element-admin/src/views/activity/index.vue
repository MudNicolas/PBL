<template>
    <div class="container" v-loading="loading" element-loading-text="加载中">
        <component :is="activeComponent" :activity-id="activityID"></component>
    </div>
</template>

<script>
import TimeLineProject from "./components/timeline-project.vue"
import { getActivityInfo } from "@/api/activity"
export default {
    name: "ActivityView",
    components: { TimeLineProject },
    data() {
        return {
            activityID: "",
            activeComponent: "",
            loading: false,
        }
    },
    created() {
        this.activityID = this.$route.params.id
        this.getInfo()
    },
    methods: {
        getInfo() {
            this.loading = true
            let activityID = this.activityID
            getActivityInfo({ activityID }).then().catch()
        },
    },
}
</script>

<style lang='scss' scoped>
.container {
    padding: 30px;
    min-height: 80vh;
}
</style>
