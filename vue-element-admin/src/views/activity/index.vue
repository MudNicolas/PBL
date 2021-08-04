<template>
    <div class="container" v-loading="loading" element-loading-text="加载中">
        <div class="header">
            <div class="title">{{ activity.name }}</div>
            <div class="info">
                {{ activity.intro | noIntro }}
            </div>

            <el-descriptions border direction="vertical" class="options">
                <el-descriptions-item
                    v-for="(value, key) of activity.options"
                    :key="'options' + key + value"
                >
                    <template slot="label">
                        {{ key | keyFilter }}
                    </template>
                    {{ value | valueFilter }}
                </el-descriptions-item>
            </el-descriptions>
        </div>
        <component
            :is="activeComponent"
            :activity-id="activityID"
            :type="activeComponent"
        ></component>
    </div>
</template>

<script>
import TimeLineProject from "./components/timeline-project"
import { getActivityInfo } from "@/api/activity"
import { normalFormatTime } from "@/utils/index.js"
export default {
    name: "ActivityView",
    components: { TimeLineProject },
    filters: {
        noIntro: function (val) {
            if (!val) {
                return "暂无简介"
            }
            return val
        },
        keyFilter: function (val) {
            let map = {
                authorType: "作者类型",
                isTimeLimited: "是否限时",
                limitTime: "限时",
                isUseCommentTemplate: "是否使用发言模板",
                commentTemplate: "发言模板",
                isNeedApprove: "项目是否需要审批",
            }
            return map[val] || val
        },
        valueFilter: function (val) {
            if (typeof val === "object") {
                //formattime
                if (
                    val[0] &&
                    val[1] &&
                    new Date(val[0]).toString() !== "Invalid Date" &&
                    new Date(val[1]).toString() !== "Invalid Date"
                ) {
                    return `${normalFormatTime(new Date(val[0]), "{y}年{m}月{d}日 {h}点{i}分")} 至
                        ${normalFormatTime(new Date(val[1]), "{y}年{m}月{d} {h}点{i}分")}`
                }
                return val.join("，")
            }
            let map = {
                true: "是",
                false: "否",
                personal: "个人",
                group: "小组",
            }
            return map[val] || val
        },
    },
    data() {
        return {
            activityID: "",
            activeComponent: "",
            loading: false,
            activity: {
                name: "",
                intro: "",
                options: {},
            },
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
                    let { type, name, intro, options } = res.data
                    this.activeComponent = type
                    this.activity = {
                        name,
                        intro,
                        options,
                    }
                })
                .catch()
        },
    },
}
</script>

<style lang='scss' scoped>
.container {
    padding: 40px;
    min-height: 80vh;
    color: #606266;

    .header {
        .title {
            font-size: 20px;
            margin-bottom: 10px;
            line-height: 1.7;
        }
        .info {
            font-size: 14px;
            margin-bottom: 12px;
        }
        .options {
            font-size: 15px;
            margin-bottom: 30px;
            line-height: 22px;
        }
    }
}
</style>
