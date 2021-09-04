<template>
    <div>
        <el-tabs type="card" v-model="activeName">
            <el-tab-pane
                v-for="component of avaliableComponents"
                :key="'ActivityTab' + component.name"
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
import checkPermission from "@/utils/permission" // 权限判断函数
import { mapGetters } from "vuex"
import privateSpace from "./components/private-space"
import publicSpace from "./components/public-space"
import statistics from "./components/statistics"
import overview from "./components/overview"

export default {
    name: "TimeLineProjectActivity",
    props: ["type", "activityId"],
    components: { privateSpace, publicSpace, statistics, overview },
    data() {
        let activeName
        if (this.checkPermission(["student"])) {
            activeName = "privateSpace"
        } else {
            activeName = "publicSpace"
        }

        return {
            activityID: "",
            activeName,
            avaliableComponents: [],
            components: [
                { name: "privateSpace", label: "私有空间", role: ["student"] },
                { name: "publicSpace", label: "公共空间", role: ["student", "teacher"] },
                { name: "statistics", label: "信息统计", role: ["student"] },
                { name: "overview", label: "私有空间总览与状态管理", role: ["teacher"] },
            ],
        }
    },
    created() {
        this.activityID = this.activityId
        // init the default selected tab
        const tab = this.$route.query.tab
        if (tab) {
            this.activeName = tab
        }
        let role = this.roles[0]
        this.avaliableComponents = this.components.filter(e => e.role.includes(role))
    },
    computed: {
        ...mapGetters(["roles"]),
    },
    watch: {
        activeName(val) {
            if (
                val &&
                this.avaliableComponents.some(e => {
                    return e.name === val
                })
            ) {
                this.$router.push(`${this.$route.path}?tab=${val}`)
            } else {
                this.activeName = this.checkPermission(["student"]) ? "privateSpace" : "publicSpace"
            }
        },
        "$route.query.tab"(val) {
            if (
                val &&
                this.avaliableComponents.some(e => {
                    return e.name === val
                })
            ) {
                this.activeName = val
            }
        },
    },
    methods: {
        checkPermission,
    },
}
</script>

<style>
</style>
