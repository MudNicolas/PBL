<template>
    <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import * as echarts from "echarts/core"
import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components"
import { RadarChart } from "echarts/charts"
import { CanvasRenderer } from "echarts/renderers"
import resize from "./mixins/resize"

echarts.use([TitleComponent, TooltipComponent, RadarChart, CanvasRenderer, LegendComponent])

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
        title: {
            type: String,
            default: "个人或小组互动总情况",
        },
        personalOrGroupTotalData: {
            type: Array,
            default: () => [],
        },
        classData: {
            type: Object,
            default: () => ({
                avg: [],
                most: [],
            }),
        },

        legend: {
            type: Array,
            default: () => [],
        },
        indicator: {
            type: Array,
            default: () => [],
        },
        seriesName: {
            type: String,
            default: "个人或小组总互动",
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
                    text: this.title,
                },
                tooltip: {},
                legend: {
                    data: this.legend,
                },
                radar: {
                    indicator: this.indicator,
                },
                series: [
                    {
                        type: "radar",
                        data: [
                            {
                                value: this.personalOrGroupTotalData,
                                name: this.legend[0],
                                label: {
                                    show: true,
                                },
                            },
                            {
                                value: this.classData.avg,
                                name: "班级平均互动",
                                label: {
                                    show: true,
                                },
                            },
                            {
                                value: this.classData.most,
                                name: "班级最高互动",
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
