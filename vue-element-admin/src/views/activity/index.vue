<template>
    <div class="container" v-loading="loading" element-loading-text="加载中">
        <component
            :is="activeComponent"
            :activity-id="activityID"
            :type="activeComponent"
        ></component>
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
            getActivityInfo({ activityID })
                .then(res => {
                    this.loading = false
                    this.activeComponent = res.data
                })
                .catch()
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
