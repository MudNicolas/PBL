<template>
    <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import * as echarts from "echarts/core"
import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components"
import { PieChart } from "echarts/charts"
import { CanvasRenderer } from "echarts/renderers"
import resize from "./mixins/resize"

echarts.use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer])

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
                    text: "你的活动数据",
                    left: "center",
                },
                tooltip: {
                    trigger: "item",
                },
                legend: {
                    orient: "vertical",
                    left: "left",
                },
                series: [
                    {
                        name: "访问来源",
                        type: "pie",
                        radius: "60%",
                        data: [
                            { value: 1048, name: "搜索引擎" },
                            { value: 735, name: "直接访问" },
                            { value: 580, name: "邮件营销" },
                            { value: 484, name: "联盟广告" },
                            { value: 300, name: "视频广告" },
                        ],
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: "rgba(0, 0, 0, 0.5)",
                            },
                        },
                    },
                ],
            })
        },
    },
}
</script>

<style>
</style>
