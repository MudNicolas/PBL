<template>
  <!--TODO：可按节显示发言情况，可显示总体发言情况，可显示发言情况排名-->
  <div v-loading="!dataRecevied" class="container">
    <div v-if="dataRecevied">
      <group-chart
        v-for="(s, index) of chartData"
        :key="s.name"
        :chart-data="s.data"
        :class-data="
          authorType === 'group' && index === chartData.length - 1
            ? chartClassData.group
            : chartClassData.personal
        "
        :indicator="indicator"
        :title="s.title"
        :legend="[s.title, '班级平均互动', '班级最高互动']"
      />

      <StatisticTable :table-data="tableData" />
    </div>
  </div>
</template>

<script>
import groupChart from './components/group.vue'
import { getTimelineStatisticData } from '@/api/statistic'
import StatisticTable from '@/components/StatisticTable'

export default {
    components: { groupChart, StatisticTable },
    data() {
        return {
            dataRecevied: false,
            chartData: [],
            activityID: this.$route.params.id,
            chartClassData: [],
            tableData: [],
            indicator: [], // 评论数，回复数，entry评论数，普通评论
            authorType: 'personal'
        }
    },
    created() {
        this.getData()
    },
    methods: {
        getData() {
            const activityID = this.activityID
            getTimelineStatisticData({ activityID })
                .then(res => {
                    const { data } = res
                    const { chartClassData, chartData, indicator, tableData, authorType } = data
                    this.chartClassData = chartClassData
                    this.chartData = chartData

                    indicator[indicator.length - 1] = {
                        name: '普通评论'
                    }
                    this.indicator = indicator

                    this.tableData = tableData
                    this.authorType = authorType
                    this.dataRecevied = true
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }
}
</script>

<style lang='scss' scoped>
.container {
    min-height: 40vh;
    padding-top: 20px;
}
p {
    font-size: 14px;
    margin-bottom: 24px;
}
</style>
