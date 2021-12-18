<template>
    <!--TODO：可按节显示发言情况，可显示总体发言情况，可显示发言情况排名-->
    <div class="container" v-loading="!dataRecevied">
        <group-chart v-if="dataRecevied" />
    </div>
</template>

<script>
import groupChart from "./components/group.vue"
import { getTimelineStatisticData } from "@/api/statistic"
export default {
    components: { groupChart },
    data() {
        return {
            dataRecevied: false,
            chartData: [],
            activityID: this.$route.params.id,
        }
    },
    created() {
        this.getData()
    },
    methods: {
        getData() {
            let activityID = this.activityID
            getTimelineStatisticData({ activityID })
        },
    },
}
</script>

<style lang='scss' scoped>
.container {
    min-height: 40vh;
    padding-top: 20px;
}
</style>
