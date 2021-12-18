<template>
    <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import * as echarts from "echarts/core"
import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components"
import { RadarChart } from "echarts/charts"
import { CanvasRenderer } from "echarts/renderers"
import resize from "./mixins/resize"

echarts.use([TitleComponent, TooltipComponent, RadarChart, CanvasRenderer])

export default {
    mixins: [resize],
    props: {
        className: {
            type: String,
            default: "chart",
        },
        width: {
            type: String,
            default: "100%",
        },
        height: {
            type: String,
            default: "500px",
        },
    },
    data() {
        return {
            chart: null,
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.initChart()
        })
    },

    methods: {
        initChart() {
            this.chart = echarts.init(this.$el)

            this.chart.setOption({
                title: {
                    text: "小组成员1发帖统计图",
                },
                tooltip: {},
                legend: {
                    data: ["小组成员1", "平均互动", "最高互动"],
                },
                radar: {
                    indicator: [
                        {
                            name: "sales",
                        },
                        {
                            name: "Administration",
                        },
                        {
                            name: "Information Techology",
                        },
                        {
                            name: "Customer Support",
                        },
                        {
                            name: "Development",
                        },
                        {
                            name: "Marketing",
                        },
                    ],
                },
                series: [
                    {
                        name: "预算 vs 开销（Budget vs spending）",
                        type: "radar",
                        data: [
                            {
                                value: [4300, 10000, 28000, 35000, 50000, 19000],
                                name: "小组成员1",
                                label: {
                                    show: true,
                                },
                            },
                            {
                                value: [5000, 14000, 28000, 31000, 42000, 21000],
                                name: "平均互动",
                                label: {
                                    show: true,
                                },
                            },
                            {
                                value: [5000, 14000, 28000, 31000, 42000, 21000],
                                name: "最高互动",
                                label: {
                                    show: true,
                                },
                            },
                        ],
                    },
                ],
            })
        },
    },
}
</script>

<style>
</style>
