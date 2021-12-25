<template>
    <div>
        <el-table
            :data="tableData"
            :span-method="objectSpanMethod"
            border
            style="width: 100%; margin-top: 20px"
            v-loading="loading"
        >
            <el-table-column label="组名" align="center">
                <template slot-scope="scope">
                    {{ scope.row.groupName | groupNameFilter }}
                </template>
            </el-table-column>
            <el-table-column prop="name" label="姓名" align="center"></el-table-column>
            <el-table-column
                prop="commentNumber"
                label="个人总贴量"
                align="center"
            ></el-table-column>
            <el-table-column
                prop="groupCommentNumber"
                label="小组总贴量"
                align="center"
            ></el-table-column>

            <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                    <el-button type="primary" @click="showChartDialog(scope.row.index)">
                        查看详情
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog :title="`${currentChartData.groupName}详情`" :visible.sync="chartVisible">
            <chart
                v-for="(s, index) of currentChartData.chartData"
                :key="s.name"
                :chartData="s.data"
                :classData="
                    currentChartData.authorType === 'group' &&
                    index === currentChartData.chartData.length - 1
                        ? currentChartData.chartClassData.group
                        : currentChartData.chartClassData.personal
                "
                :indicator="currentChartData.indicator"
                :title="s.title"
                :legend="[s.title, '班级平均互动', '班级最高互动']"
            />
            <StatisticTable :tableData="currentChartData.tableData" />
        </el-dialog>
    </div>
</template>

<script>
import { teacherGetAllStatistics } from "@/api/statistic"
import chart from "@/components/StatisticChart"
import StatisticTable from "@/components/StatisticTable"

export default {
    props: ["activityId"],
    components: { chart, StatisticTable },
    filters: {
        groupNameFilter: val => {
            if (!val) return "暂无组名"
            return val
        },
    },
    data() {
        return {
            tableData: [],
            loading: false,
            zipData: [],
            spanList: new Set([0, 3, 4]),
            chartVisible: false,
            chartIndex: 0,
            currentChartData: {},
        }
    },
    created() {
        this.getData()
    },
    methods: {
        getData() {
            this.loading = true
            teacherGetAllStatistics({ activityID: this.activityId })
                .then(res => {
                    let { data } = res
                    this.zipData = data
                    data.map((e, index) => {
                        e.tableData[0].groupName = e.groupName
                        e.tableData[0].length = e.tableData.length
                        e.tableData[0].index = index
                        this.tableData = [...this.tableData, ...e.tableData]
                    })
                    //console.log(this.zipData, this.tableData)
                    this.loading = false
                })
                .catch()
        },

        //表合并
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (this.spanList.has(columnIndex)) {
                if (row.length) {
                    return {
                        rowspan: row.length,
                        colspan: 1,
                    }
                } else {
                    return [0, 0]
                }
            }
        },

        showChartDialog(index) {
            //console.log(this.zipData)
            this.chartIndex = index
            this.currentChartData = this.zipData[index]
            this.currentChartData.indicator[this.currentChartData.indicator.length - 1] = {
                name: "普通评论",
            }

            this.chartVisible = true
        },
    },
}
</script>

<style>
</style>
