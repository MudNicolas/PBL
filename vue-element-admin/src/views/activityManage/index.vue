<template>
    <div class="container" v-loading="loading">
        <el-tabs type="border-card" v-model="activeName">
            <el-tab-pane
                v-for="component of components"
                :key="'CourseManageTab' + component.name"
                :label="component.label"
                lazy
                :name="component.name"
            >
                <component
                    v-if="activeName === component.name"
                    :is="component.name"
                    :activity-id="activityID"
                />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import info from "./components/info"
import approve from "./components/approve"
import { getAvtivityType } from "@/api/activityManage"

export default {
    components: { info, approve },
    name: "ManageCourse",

    data() {
        return {
            activityID: this.$route.params.id,
            activeName: "info",
            components: [{ name: "info", label: "活动基础信息" }],
            loading: false,
            activityType: "",
        }
    },
    created() {
        // init the default selected tab
        const tab = this.$route.query.tab
        const type = this.$route.query.type
        this.activityType = type
        this.handlePane()
        if (tab) {
            this.activeName = tab
        }
        this.getAvtivityType()
    },
    methods: {
        getAvtivityType() {
            this.loading = true
            let { activityID } = this
            getAvtivityType({ activityID })
                .then(res => {
                    this.loading = false

                    if (this.activityType && this.activityType !== res.data.type) {
                        this.$router.replace("/404")
                    }

                    if (!this.activityType) {
                        this.activityType = res.data.type
                        this.handlePane()
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        },
        handlePane() {
            let { activityType, components } = this
            if (activityType === "TimeLineProject") {
                let addition = [
                    {
                        name: "approve",
                        label: "项目审批",
                    },

                    {
                        name: "statistics",
                        label: "信息统计",
                    },
                ]
                this.components = [...components, ...addition]
            }
        },
    },
    watch: {
        activeName(val) {
            if (
                val &&
                this.components.some(e => {
                    return e.name === val
                })
            ) {
                this.$router.push({
                    path: this.$route.path,
                    query: { tab: val, type: this.activityType },
                })
            } else {
                this.activeName = "info"
            }
        },
        "$route.query.tab"(val) {
            if (
                val &&
                this.components.some(e => {
                    return e.name === val
                })
            ) {
                this.activeName = val
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.container {
    padding: 30px;
    min-height: 80vh;
}
</style>
